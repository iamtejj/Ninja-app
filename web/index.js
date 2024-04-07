// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import PrivacyWebhookHandlers from "./privacy.js";
import mongoose from "mongoose";
import ShippingInfoModal from "./modal/shippingData.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`mongodb://localhost:27017/ninjaapp`);
    console.log(`MongoDB Connected: {conn.connection.host}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
connectDB()
// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);
// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});
app.get("/api/shippingdata2",(req,res)=>{
  return res.status(200).json({message:"hello"})
})
app.post("/api/shippingdata",async (req,res)=>{
  const shop = res.locals.shopify.session.shop;
  console.log(shop,"shop")
  const {goal,initialmessage,progressMsgPre,progressMsgPost,archivedMessage} = req.body;
  try {
    const shippingConfig = await ShippingInfoModal.findOneAndUpdate(
      { shop: shop },
      {
        goal,
        initialmessage,
        progressMsgPre,
        progressMsgPost,
        archivedMessage
      },
      { upsert: true }
    )
      return res.status(200).json(shippingConfig)
  } catch (error) {
    
    return res.status(402).json({
      error,
      message:"Something wrong happen"
    })
  }
})
app.get("/api/shippingdata",async (req,res)=>{

  const shop = res.locals.shopify.session.shop;
  console.log("shop")
  console.log(shop)
  try {
    const shippingData = await ShippingInfoModal.findOne({shop});
    return res.status(200).json(shippingData);
    
  } catch (error) {
    return res.status(402).json({
      error,
      message:"Something wrong happen"
    })
  }
});

app.get('/app',async (req,res)=>{
  const shop = req.query.shop;
  try {
    const shippingData = await ShippingInfoModal.findOne({shop});
    return res.status(200).json(shippingData);
    
  } catch (error) {
    return res.status(402).json({
      error,
      message:"Something wrong happen"
    })
  }
})

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
