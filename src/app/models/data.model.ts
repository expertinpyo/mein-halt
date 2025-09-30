export interface LocationOption {
  id: string | number,
  stopPlaceRef: string,
  name: string,
  lat: number,
  lot: number,
  mode: string 
}

export interface LocationDetail {
  id: number,
  name : string,
  ttTime: string,
  etTime: string,
  publicCd: string,
  mode: string,
  destination: string
}