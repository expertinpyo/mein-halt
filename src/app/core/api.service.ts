import {Injectable, inject} from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs'
import { environment } from '@env/environment'
import { XMLParser } from 'fast-xml-parser'
import { LocationOption, LocationDetail } from '@app/models/data.model'


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = environment.apiUrl
  private readonly TOKEN = environment.token 
  private http = inject(HttpClient)

  getHeader = () => {
    return new HttpHeaders({
      "Content-Type": "application/xml",
      "Authorization": `Bearer ${this.TOKEN}`,
    });
  }

  getStationTable(location:LocationOption) : Observable<any[]> {
    if(!location)
      return of([]);
    console.log("Station Table Request !")

    const stopPlaceRef = location.stopPlaceRef;

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
                    <NumberOfResults>10</NumberOfResults>
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
    return this.http.post(this.BASE_URL, xml, {
      headers: this.getHeader(),
      responseType: 'text'
    }).pipe(
      map(xmlResponse => {
        try{
          const parser = new XMLParser()
          const jsonObj = parser.parse(xmlResponse);
          const result = jsonObj.OJP?.OJPResponse?.['siri:ServiceDelivery']?.OJPStopEventDelivery?.StopEventResult
          if (!Array.isArray(result)) throw new Error('No Result')
          const locationDetails : LocationDetail[] = result.map((item, index) => {
            const stopEvent = item.StopEvent
            console.log(stopEvent)
            if(!stopEvent) throw new Error ('No Place Information')

            const prevCall = stopEvent.PreviousCall
            const thisCall = stopEvent.ThisCall
            const onwardCall = stopEvent.OnWardCAll
            const serviceDetail = stopEvent.Service

            const name = thisCall.CallAtStop.StopPointName.Text
            const ttTime = thisCall.CallAtStop.ServiceArrival.TimetabledTime
            const etTime = thisCall.CallAtStop.ServiceArrival.EstimatedTime ?? ttTime
            const publicCd = serviceDetail.PublicCode
            const mode = serviceDetail.Mode.PtMode
            const destination = serviceDetail.DestinationText.Text
            
            const location: LocationDetail = {
              id: index,
              name: name,
              ttTime: ttTime,
              etTime: etTime,
              mode: mode,
              publicCd: publicCd,
              destination: destination
            }
            return location
          })

          return locationDetails.filter(item=>item.id < 2)
        }
        catch (e) {
          console.log("Error While parsing XML to Json : ", e);
          return [];
        }
      })
    )
  }


  getLocationOptions(location:string, limit:number = 5): Observable<any[]> {
    console.log("Initial : ", location)
    const trimmed = location.trim();
    
    if(!trimmed)
      return of([]);

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
    return this.http.post(this.BASE_URL, xml, {
      headers: this.getHeader(),
      responseType: 'text'
    }).pipe(
      map(xmlResponse => {
        try {
          const parser = new XMLParser();
          const jsonObj = parser.parse(xmlResponse);
          const result = jsonObj.OJP?.OJPResponse?.['siri:ServiceDelivery']?.OJPLocationInformationDelivery?.PlaceResult
          if (!Array.isArray(result)) return [];
          return result;
        } catch (err) {
          throw { type: 'ParsingError', originalError: err}
        }
      }),
      map((result: any[])=> {
        try {
          const locationOptions : LocationOption[] = result.map((item, index)=> {
          const place = item.Place
          if(!place) return null;

          const geoPosition = place.GeoPosition
          const mode = place.Mode.PtMode
          const name = place.Name.Text
          const stopPlaceRef = place.StopPlace.StopPlaceRef

          if(!geoPosition || !mode || !name || !stopPlaceRef) return null;

          const location : LocationOption = {
            id: index,
            stopPlaceRef: stopPlaceRef,
            name: name,
            lat: geoPosition['siri:Latitude'],
            lot: geoPosition['siri:Longitude'],
            mode: mode
          }
            return location
          }).filter((location): location is LocationOption => location !== null)
          return locationOptions
        } catch (err) {
          throw {type: 'ParsingError', originalError: err}
        }
      }),
      catchError(err=>{
        if(err.type === 'ParsingError') {
          console.log("Error in the location Parsing : ", err)
          return of([])
        }
        return throwError(()=> err);
      })
      
    )
  }
}
