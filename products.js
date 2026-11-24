/* ==================================================================
   READY-TO-WEAR STOCK  (Navshakti Collection)
   ------------------------------------------------------------------
   This is the only file you edit when new stock arrives.

   ADD A PIECE   copy one { ... } block, change the details, and put
                 its photo in the /images folder.
   SOLD OUT      set  status: "sold"   (the card stays, greyed out)
   REMOVE        delete the whole { ... } block.

   status    "new" | "available" | "few" (only 1–2 left) | "sold"
   category  "lehenga" | "chaniya" | "saree" | "anarkali"
   price     in INR, numbers only, no commas  (e.g. 14500)
   shipsIn   working days to dispatch a ready size (alterations included)
   customIn  optional: working days to make it in the client's measurements.
             Leave it out to use AUBURNN_SHIPPING.customIn below.

   DRAFT NOTE: names, prices and descriptions below are placeholders
   written around the Instagram photos. Replace with Auburnn's real
   stock details before launch.
   ================================================================== */

// Indicative conversion for overseas visitors (INR -> currency). Update monthly.
window.AUBURNN_CURRENCY = {
  INR: { rate: 1, symbol: "₹", locale: "en-IN" },
  USD: { rate: 0.0113, symbol: "$", locale: "en-US" },
  CAD: { rate: 0.0158, symbol: "C$", locale: "en-CA" }
};

// Delivery estimates shown on every piece. Transit = working days after
// dispatch (same numbers as the shipping table on the page).
window.AUBURNN_SHIPPING = {
  customIn: 20,               // default making time for "Custom fit", in working days
  destinations: {
    IN:  { label: "India",            short: "India",  currency: "INR", transit: [3, 6] },
    US:  { label: "United States",    short: "USA",    currency: "USD", transit: [5, 9] },
    CA:  { label: "Canada",           short: "Canada", currency: "CAD", transit: [5, 9] },
    ROW: { label: "Other countries",  short: "Other",  currency: "USD", transit: [6, 12] }
  }
};

window.AUBURNN_PRODUCTS = [
  {
    id: "NS-01",
    name: "Midnight Mirror Corset Set",
    category: "chaniya",
    price: 14500,
    image: "images/navy-lehenga-hanger.jpg",
    sizes: ["S", "M", "L"],
    status: "new",
    shipsIn: 4,
    description: "Navy georgette skirt with a mirror-work waistband, paired with a gold sequin corset blouse and tassel tie-back."
  },
  {
    id: "NS-02",
    name: "Sunset Stripe Chaniya Choli",
    category: "chaniya",
    price: 12800,
    image: "images/orange-stripe-lehenga-hanger.jpg",
    sizes: ["S", "M", "L", "XL"],
    status: "new",
    shipsIn: 4,
    description: "Orange and rani-pink panelled skirt with latkans, worn with a fuchsia sweetheart blouse."
  },
  {
    id: "NS-03",
    name: "Ivory Gota Lehenga",
    category: "lehenga",
    price: 18500,
    image: "images/ivory-lehenga-palmgreens.jpg",
    sizes: ["XS", "S", "M", "L"],
    status: "few",
    shipsIn: 2,
    description: "Soft ivory flare with gold gota borders and an embellished bustier. Made for Sharad Purnima nights."
  },
  {
    id: "NS-04",
    name: "Marigold Lehenga Set",
    category: "lehenga",
    price: 16900,
    image: "images/orange-lehenga.jpg",
    sizes: ["S", "M", "L"],
    status: "available",
    shipsIn: 3,
    description: "Sun-bright marigold lehenga with a pleated choli and a sheer dupatta edged in gold."
  },
  {
    id: "NS-05",
    name: "Emerald Halter Choli",
    category: "chaniya",
    price: 11500,
    image: "images/green-lehenga.jpg",
    sizes: ["XS", "S", "M"],
    status: "available",
    shipsIn: 3,
    description: "Parrot-green flared skirt with a textured halter blouse. Light enough for all nine nights."
  },
  {
    id: "NS-06",
    name: "Rani Pink Flare Lehenga",
    category: "lehenga",
    price: 15500,
    image: "images/pink-lehenga-twirl.jpg",
    sizes: ["S", "M", "L"],
    status: "few",
    shipsIn: 2,
    description: "A full-circle rani pink skirt with a gold border and a lace-up back blouse. Built to twirl."
  },
  {
    id: "NS-07",
    name: "Jamun Purple Chaniya Choli",
    category: "chaniya",
    price: 12500,
    image: "images/purple-lehenga-diyas.jpg",
    sizes: ["S", "M"],
    status: "sold",
    shipsIn: 3,
    description: "Deep purple chaniya with a checked mirror-work blouse and contrast dupatta."
  },
  {
    id: "NS-08",
    name: "Noir Embroidered Lehenga",
    category: "lehenga",
    price: 19500,
    image: "images/black-lehenga-marigold.jpg",
    sizes: ["S", "M", "L"],
    status: "available",
    shipsIn: 3,
    description: "Black lehenga with tonal embroidery and a structured blouse, for evening receptions."
  },
  {
    id: "NS-09",
    name: "Moonlight Anarkali",
    category: "anarkali",
    price: 13900,
    image: "images/white-anarkali.jpg",
    sizes: ["S", "M", "L", "XL"],
    status: "available",
    shipsIn: 3,
    description: "Floor-length white anarkali with a sheer dupatta. Easy to wear for puja and day functions."
  },
  {
    id: "NS-10",
    name: "Peacock Teal Saree",
    category: "saree",
    price: 9800,
    image: "images/teal-saree.jpg",
    sizes: ["Free size"],
    status: "available",
    shipsIn: 3,
    description: "Teal drape with an embellished blouse piece. The blouse is stitched to your measurements."
  }
];
