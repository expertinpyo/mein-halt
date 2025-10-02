import dotenvFlow from "dotenv-flow";
dotenvFlow.config()

import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import axios from 'axios';

const {
  PORT,
  ALLOWED_ORIGIN,
  UPSTREAM_BASE_URL,
  SECRET_API_KEY
} = process.env;

if(!UPSTREAM_BASE_URL){
  console.error('[BOOT] Missing BASE URL in env')
  process.exit(1)
}

if(!SECRET_API_KEY){
  console.error('[BOOT] Missing SECRET KEY in env')
  process.exit(1)
}

const app = express()

app.use(helmet());
app.use(morgan('tiny'));
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials:true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', ]
  })
)

// Get Location Options
app.get('/api/locations', async(req, res) => {
  try {
    const { location, limit } = req.query;

    const now = new Date().toISOString()
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" version="2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.vdv.de/ojp ../../../../Downloads/OJP-changes_for_v1.1%20(1)/OJP-changes_for_v1.1/OJP.xsd">
      <OJPRequest>
        <siri:ServiceRequest>
        <siri:RequestTimestamp>${now}</siri:RequestTimestamp>
        <siri:RequestorRef>myapp_test</siri:RequestorRef>
        <OJPLocationInformationRequest>
          <siri:RequestTimestamp>${now}</siri:RequestTimestamp>
          <siri:MessageIdentifier>LIR-1a</siri:MessageIdentifier>
          <InitialInput>
            <Name>${location}</Name>
          </InitialInput>
          <Restrictions>
              <Type>stop</Type>
              <NumberOfResults>${limit}</NumberOfResults>
          </Restrictions>
        </OJPLocationInformationRequest>
        </siri:ServiceRequest>
      </OJPRequest>
    </OJP>
    `

    const upstream = await axios.post(
      `${UPSTREAM_BASE_URL}`,
      xml,
      {
        headers:{
          'Authorization': `Bearer ${SECRET_API_KEY}`,
          'Content-Type': 'application/xml',
        },
        responseType: 'text'
      }
    );

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(upstream.data);
  
  } catch (err) {
    res.status(500).json({error : 'Proxy Error'})
  }
})


// Get Location Details
app.get('/api/details', async(req, res) => {
  try {
    const { stopPlaceRef, limit } = req.query;

    const now = new Date().toISOString()
    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <OJP xmlns="http://www.vdv.de/ojp" xmlns:siri="http://www.siri.org.uk/siri" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xsi:schemaLocation="http://www.vdv.de/ojp" version="2.0">
    <OJPRequest>
        <siri:ServiceRequest>
            <siri:ServiceRequestContext>
                <siri:Language>de</siri:Language>
            </siri:ServiceRequestContext>
            <siri:RequestTimestamp>${now}</siri:RequestTimestamp>
            <siri:RequestorRef>SKIPlus</siri:RequestorRef>
            <OJPStopEventRequest>
                <siri:RequestTimestamp>${now}</siri:RequestTimestamp>
                <siri:MessageIdentifier>SER_1</siri:MessageIdentifier>
                <Location>
                    <PlaceRef>
                        <siri:StopPointRef>${stopPlaceRef}</siri:StopPointRef>
                    </PlaceRef>
                    <DepArrTime>${now}</DepArrTime>
                </Location>
                <Params>
                    <NumberOfResults>${limit}</NumberOfResults>
                    <StopEventType>arrival</StopEventType>
                    <IncludePreviousCalls>true</IncludePreviousCalls>
                    <IncludeOnwardCalls>true</IncludeOnwardCalls>
                    <UseRealtimeData>explanatory</UseRealtimeData>
                </Params>
            </OJPStopEventRequest>
        </siri:ServiceRequest>
    </OJPRequest>
    </OJP>
    `

    const upstream = await axios.post(
      `${UPSTREAM_BASE_URL}`,
      xml,
      {
        headers:{
          'Authorization': `Bearer ${SECRET_API_KEY}`,
          'Content-Type': 'application/xml',
        },
        responseType: 'text'
      }
    );

    res.setHeader('Content-Type', 'application/xml');
    res.status(200).send(upstream.data);
  
  } catch (err) {
    res.status(500).json({error : 'Proxy Error'})
  }
})

app.listen(Number(PORT), () => {
  console.log(`[BOOT] MEIN HALT server listening on :${PORT} (${process.env.NODE_ENV})`);
});
