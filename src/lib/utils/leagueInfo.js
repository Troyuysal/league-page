/*   STEP 1   */
export const leagueID = "1177717282969354240"; // your league ID
export const leagueName = "Bynasty"; // your league name
export const dues = 100; // (optional) used in template constitution page
export const dynasty = true; // true for dynasty leagues, false for redraft and keeper
export const enableBlog = false; // requires VITE_CONTENTFUL_ACCESS_TOKEN and VITE_CONTENTFUL_SPACE environment variables

/*   STEP 2   */
export const homepageText = `
  <p>Welcome to Bynasty, the SLO KX Dynasty League.</p>
`;

/*   STEP 3   */
// To omit an optional field, set its value to null

export const managers = [
  {
    "managerID": "290032316598743040",
    "name": "stonkboi",
    "location": "Brooklyn",
    "bio": "League Commissioner & Dynasty Manager",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2014,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "459474320909922304",
    "name": "colemanim",
    "location": null,
    "bio": "Dynasty Manager",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "828451834145374208",
    "name": "Zachwhite15",
    "location": null,
    "bio": "Manager of Never Write Back",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "864312118718128128",
    "name": "JakeEhmann",
    "location": null,
    "bio": "Dynasty Manager",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "996895608017334272",
    "name": "carsonkman",
    "location": null,
    "bio": "Manager of King Henry’s Court",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "996897187638370304",
    "name": "Neto2526",
    "location": null,
    "bio": "Manager of Nico Harrison’s New Era",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "996902115312234496",
    "name": "eddiego222",
    "location": null,
    "bio": "Manager of Geor’Quarius Spivey",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "998005310931513344",
    "name": "GrahamEdelman",
    "location": null,
    "bio": "Manager of Brock and Ball Torture",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "1043604934555566080",
    "name": "TheMidGatsby",
    "location": null,
    "bio": "Manager of Dr. Philly & Mini-Murray",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  },
  {
    "managerID": "1045832302267494400",
    "name": "nlockareff",
    "location": null,
    "bio": "Manager of Stale Tutens",
    "photo": "/managers/name.jpg",
    "fantasyStart": 2020,
    "favoriteTeam": "nyj",
    "mode": "Win Now",
    "rival": {
      "name": "Rival",
      "link": null,
      "image": "/managers/everyone.png"
    },
    "favoritePlayer": 1426,
    "valuePosition": "WR",
    "rookieOrVets": "Rookies",
    "philosophy": "Win at all costs",
    "tradingScale": 10,
    "preferredContact": "Sleeper"
  }
];

/*   !!  !!  IMPORTANT  !!  !! */
/*
Below is the most up to-date version of a manager. Please leave this commented out
and don't delete it. This will be updated if any fields are added, removed or changed
and will allow updates without causing merge conflicts
*/

// {
//   "managerID": "12345678",  
//   "name": "Your Name",
//   "location": "Brooklyn", 
//   "bio": "Lorem ipsum...",
//   "photo": "/managers/name.jpg", 
//   "fantasyStart": 2014, 
//   "favoriteTeam": "nyj", 
//   "mode": "Win Now", 
//   "rival": {
//     name: "Rival", 
//     link: null, 
//     image: "/managers/everyone.png", 
//   },
//   "favoritePlayer": 1426, 
//   "valuePosition": "WR", 
//   "rookieOrVets": "Rookies", 
//   "philosophy": "Your fantasy team's philosophy", 
//   "tradingScale": 10, 
//   "preferredContact": "Text",  
// },
