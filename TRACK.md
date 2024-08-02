```js
const r1 = {
  IsJsEnabled: 0,
  KeywordDep: "40, RUE ABBÉ GRÉGOIRE - GRENOBLE",
  NumDep: 40,
  PointDep: "152084_3_40",
  Departure: {
    $type: "Cityway.TSI.Core.Model.Transport.RoadModel, Cityway.TSI.Core",
    Length: 1151,
    Number: 40,
    RoadId: 152084,
    IsRoadLength: true,
    FirstNumber: 6,
    LastNumber: 112,
    Id: 152084,
    Name: "RUE ABBÉ GRÉGOIRE",
    TypePoint: 3,
    Locality: {
      Id: 38185,
      Name: "GRENOBLE",
      Code: "38185",
      Longitude: 5.735874577533315,
      Latitude: 45.1858813764503,
    },
    Longitude: 5.712371085659833,
    Latitude: 45.186742070869556,
  },
  DepartureState: 0,
  LatDep: 45.1867420708696,
  LngDep: 5.71237108565983,
  KeywordArr: "HOTEL DE VILLE - GRENOBLE",
  PointArr: "2002289_4",
  Arrival: {
    $type: "Cityway.TSI.Core.Model.Transport.LogicalStopModel, Cityway.TSI.Core",
    Id: 2002289,
    Name: "HOTEL DE VILLE",
    TypePoint: 4,
    Locality: {
      Id: 38185,
      Name: "GRENOBLE",
      Code: "38185",
      Longitude: 5.735874577533315,
      Latitude: 45.1858813764503,
    },
    Longitude: 5.73744659885,
    Latitude: 45.18749204882501,
    PostalCode: "38000",
  },
  ArrivalState: 0,
  LatArr: 45.187492048825,
  LngArr: 5.73744659885,
  Date: "28/07/2024",
  TypeDate: 68,
  Hour: 13,
  Minute: 45,
  Algorithm: "Fastest",
  TypeTrip: "PlanTrip",
  Modes: ["Bus", "Coach", "Metro", "Tram", "Tod", "Tgv", "Ter", "Train", "Plane"],
  ListModes: "Bus|Coach|Metro|Tram|Tod|Tgv|Ter|Train|Plane",
  IgnoreDisruptions: false,
  WalkDistance: 2000,
  WalkSpeed: 4,
  CarDistance: 100,
  BikeDistance: 10,
  BikeSpeed: 15,
  BikeSecure: 2,
}
const r2 = {
  PointDep: "152084_3_40",
  PointArr: "2002289_4",
  Date: new Date().toLocaleDateString("en-GB"),
  TypeDate: 68,
  Hour: new Date().getHours(),
  Minute: new Date().getMinutes(),
}
const q1 = await fetch("/itinisere/fr/itineraires/4/JourneyPlanner/PartialResult", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
  body: new URLSearchParams({ request: JSON.stringify(r1) }),
})
const q2 = await fetch("/itinisere/fr/itineraires/4/JourneyPlanner/PartialResult", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
  body: new URLSearchParams({ request: JSON.stringify(r2) }),
})
const d1 = await q1.text()
const d2 = await q2.text()
const h1 = new DOMParser().parseFromString(d1, "text/html")
const h2 = new DOMParser().parseFromString(d2, "text/html")
```

```js
const url = `https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885#form`
if (window.location.href !== url) window.location.href = url
window.$ = (selector, context = document) => context.querySelector(selector)
window.$$ = (selector, context = document) => Array.from(context.querySelectorAll(selector))
$$(".panel-trip").map((el) => {
  return {
    from: $(".hours b", el).textContent.trim(),
    to: $(".hours b:nth-of-type(2)", el).textContent.trim(),
    duration: $(".duration", el).textContent.trim(),
    modes: $$(".modes li [title]", el)
      .map((el) => el.title)
      .join(" + "),
    // type: $(".type-trip", el).textContent.trim(),
    // ecology: "CO₂ " + $$(".ecology .green", el).length,
  }
})
$$(".detail-trip")
```
