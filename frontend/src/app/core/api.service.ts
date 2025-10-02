import {Injectable, inject} from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { catchError, from, map, Observable, of, switchMap, tap, throwError } from 'rxjs'
import { environment } from '@env/environment'
import { XMLParser } from 'fast-xml-parser'
import { LocationOption, LocationDetail, LocationDetailMap } from '@app/models/data.model'


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly BASE_URL = environment.apiUrl
  private http = inject(HttpClient)

  getStationTable(location:LocationOption, limit:number=50) : Observable<any[]> {
    if(!location)
      return of([]);
    console.log("Station Table Request!")

    const stopPlaceRef = location.stopPlaceRef;
    
    const params = new HttpParams()
      .set('stopPlaceRef', stopPlaceRef)
      .set('limit', limit)

    return this.http.get(this.BASE_URL+'/api/details', {
      params: params,
      responseType: 'text'
    }).pipe(
      map(xmlResponse => {
        try{
          const parser = new XMLParser()
          const jsonObj = parser.parse(xmlResponse);
          const result = jsonObj.OJP?.OJPResponse?.['siri:ServiceDelivery']?.OJPStopEventDelivery?.StopEventResult
          if (!Array.isArray(result)) throw new Error('No Result')
          const locationDetails : LocationDetail[] = result
            .map((item, index) => {
            const stopEvent = item.StopEvent
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
          const map = new Map<string, LocationDetailMap>();
          const keyOf = (d: LocationDetail) => {
            return [d.name.trim(), d.mode.trim(), d.destination.trim(), d.publicCd].join('|')
          }

          console.log(locationDetails)

          for(const detail of locationDetails){
            const key = keyOf(detail)
            const group = map.get(key)
            if(group) {
              if(group.locationDetails.length < 2)
                group.locationDetails.push(detail)
            } else {
              map.set(key, {
                id:map.size,
                name: detail.name,
                mode: detail.mode,
                destination: detail.destination,
                publicCd: detail.publicCd,
                locationDetails: [detail]
              })
            }
          }
          return Array.from(map.values())
        }
        catch (e) {
          console.log("Error While parsing XML to Json : ", e);
          return [];
        }
      })
    )
  }

  getLocationOptions(location:string, limit:number = 10): Observable<any[]> {
    const trimmed = location.trim();
    
    if(!trimmed)
      return of([]);
    
    const params = new HttpParams()
      .set('location', location)
      .set('limit', limit)

    return this.http.get(this.BASE_URL + '/api/locations', {params: params, responseType: 'text'}).pipe(
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
