import mongoose from 'mongoose'

const shippingInfo = new mongoose.Schema({
    shop:{
      type:String
    },
    goal: {
      type: Number
    },
    initialmessage: {
      type: String
    },
    progressMsgPre: {
      type: String
    },
    progressMsgPost: {
        type: String
    },
    archivedMessage:{
        type: String
    }
  });
  
  const ShippingInfoModal = mongoose.model("Shipping Info", shippingInfo);
  
  export default ShippingInfoModal;