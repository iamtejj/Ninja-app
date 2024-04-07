import {
  Page,
  Layout,
  Grid,
  LegacyCard,
  Box,
  TextField,
  Button,
} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";
import React, { useCallback, useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

export default function HomePage() {
  const fetch = useAuthenticatedFetch()
  const [freeShippinGoal, setFreeShippinggoal] = useState(0);
  const [initialMessage,setInitialMessage] = useState('Free Shipping of order above');
  const [goalArchivedMessage,setgoalArchivedMessage] = useState('Congratulation You Got freeshipping');
  const [progressMessagePartone,setProgressMessagePartone] = useState('only')
  const [progressMessageParttwo,setProgressMessageParttwo] = useState('away from Freeshipping')
  

  function handleFreeshippingGoal(value) {
    setFreeShippinggoal(value);
  }
  function handleInitialMessage(value){
    setInitialMessage(value)
  }
  function handlePrParone(value){
    setProgressMessagePartone(value)
  }
  function handlePrPartwo(value){
    setProgressMessageParttwo(value)
  }
  function handleArchivemessage(value){
    setgoalArchivedMessage(value)
  }

  async function saveShippingInfo(){
    let data = {
      goal:Number(freeShippinGoal),
      initialmessage:initialMessage,
      progressMsgPre:progressMessagePartone,
      progressMsgPost:progressMessageParttwo,
      archivedMessage:goalArchivedMessage
    }
    console.log(data)
    const shipData = await fetch('/api/products/count')
    const myShipdata = await shipData.json()
    console.log(myShipdata);
    // const response = await fetch('/api/shippingdata', {
    //   method: "POST", // *GET, POST, PUT, DELETE, etc.
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data), // body data type must match "Content-Type" header
    // });
    // console.log(response)
    // const jsonData = await response.json()
    // console.log(jsonData)

  }
  async function renderData(){
    const data = await fetch('/api/shippingdata')
    const response = await data.json();
    setgoalArchivedMessage(response.archivedMessage)
    setFreeShippinggoal(response.goal)
    setInitialMessage(response.initialmessage)
    setProgressMessagePartone(response.progressMsgPost)
    setProgressMessageParttwo(response.progressMsgPre)
  }
  useEffect(()=>{
    renderData()
  },[])
  const { t } = useTranslation();
  return (
    <Page fullWidth>
      <Grid>
        <Grid.Cell columnSpan={{ xl: 12 }}>
          <LegacyCard title="Preview" sectioned>
            <Box background="bg-fill-info">
              <div
                style={{
                  background: "var(--p-color-border-interactive-subdued)",
                  margin: "10px 0",
                  padding: "10px 10px",
                  textAlign: "center",
                  fontSize: "25px",
                }}
              >
                {initialMessage} {freeShippinGoal}$
              </div>
            </Box>
            <Box background="bg-fill-info">
              <div
                style={{
                  background: "var(--p-color-border-interactive-subdued)",
                  margin: "10px 0",
                  padding: "10px 10px",
                  textAlign: "center",
                  fontSize: "25px",
                }}
              >
                {progressMessagePartone} 49$ {progressMessageParttwo}
              </div>
            </Box>
            <Box background="bg-fill-info">
              <div
                style={{
                  background: "var(--p-color-border-interactive-subdued)",
                  margin: "10px 0",
                  padding: "10px 10px",
                  textAlign: "center",
                  fontSize: "25px",
                }}
              >
                {goalArchivedMessage}
                <Box background="bg-fill-info"></Box>
              </div>
            </Box>
          </LegacyCard>
        </Grid.Cell>
        <Grid.Cell columnSpan={{  xl: 12 }}>
          <LegacyCard title="Free Shipping Goal:" sectioned>
            <TextField
              value={freeShippinGoal}
              onChange={(e) => {
                handleFreeshippingGoal(e);
              }}
              min={0}
              label=""
              type="number"
              helpText={
                <span>
                  if no minimum order value is required, please set goal to 0
                </span>
              }
            />
          </LegacyCard>
          <LegacyCard title="Initial Message" sectioned>
            <TextField
              value={initialMessage}
              onChange={(e) => {
                handleInitialMessage(e)
                
              }}
              min={0}
              label=""
              type="text"
              helpText={
                <span>
                  Display when cart is empty
                </span>
              }
            />
          </LegacyCard>
          <Grid>
            <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 5}}>
              <LegacyCard title="Progress Message" sectioned>
              <TextField
                value={progressMessagePartone}
                onChange={(e) => {
                  handlePrParone(e)
                }}
                min={0}
                label=""
                type="text"
                helpText={
                  <span>
                    Display when cart value less than the goal
                  </span>
                }
              />
            </LegacyCard>
            </Grid.Cell>
            <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 2}}>
              <LegacyCard title="Price" sectioned>
                  49$
              </LegacyCard>
            </Grid.Cell>
            <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 5}}>
            <LegacyCard title="Message" sectioned>
            <TextField
              value={progressMessageParttwo}
              onChange={(e) => {
                handlePrPartwo(e)
              }}
              min={0}
              label=""
              type="text"
              helpText={
                <span>
                  Display when cart value less than the goal
                </span>
              }
            />
          </LegacyCard>
            </Grid.Cell>
          </Grid>
          <LegacyCard title="Goal Achieved Message" sectioned>
            <TextField
              value={goalArchivedMessage}
              onChange={(e) => {
                handleArchivemessage(e)
              }}
              min={0}
              label=""
              type="text"
              helpText={
                <span>
                  Display when cart value greater than the goal
                </span>
              }
            />
          </LegacyCard>
        </Grid.Cell>
        <Grid.Cell columnSpan={{  xl: 12 }}>
            <Button onClick={()=>{saveShippingInfo()}}>
              Save Settings
            </Button>
        </Grid.Cell>
      </Grid>
    </Page>
  );
}
