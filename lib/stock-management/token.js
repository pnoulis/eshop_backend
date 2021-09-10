// import jwt from "jsonwebtoken";
// import base64 from "base-64";
// import Session from "#session";
// import {Stock} from "./stock.js";
// import config from "#config";
// import {weight} from "#misc/weights.js";

// const jwtOptions = {
//   issuer: config.serverDomain,
//   subject: config.clientDomain,
//   expiresIn: Session.timeOut,
// };


// const
// decodeCart = (token, cb) => {
//   jwt.verify(token, config.credentials.secretKey, (err, decoded) => {
//     if (err) return cb(err);
//     const shoppingCart = {};
//     Object.entries(decoded).forEach(([key, value]) => {
//       if (/^PO/.test(key)) shoppingCart[key] = value;
//     });
//     cb(null, shoppingCart);
//   });
// },
// encodeCart = (cart, cb) => {
//   console.log(cart);
//   console.log("about to encode base64");
//   const stringified = JSON.stringify(cart);
//   const encoded = base64.encode(stringified);
//   const decoded = base64.decode(encoded);
//   console.log("encoded");
//   console.log(encoded);
//   console.log("decoded");
//   console.log(decoded);
//   jwt.sign(cart, config.credentials.secretKey, jwtOptions, (err, token) => {
//     if (err) return cb(err);
//     return cb(null, token);
//   });
// };

// const ShoppingCart = {
//   calculateCost(cart, address, cb) {
//     const cost = {
//       totals: {price: 0, uniqueItems: 0, items: 0, weight: 0.0}
//     }, pids = Object.keys(cart);

//     const x = (i) => {
//       if (i === pids.length) return cb(null, cost);

//       Stock.getInfo(pids[i], (err, info) => {
//         if (err) return x(++i);

//         cost[pids[i]] = {
//           amount: cart[pids[i]].length,
//           price: cart[pids[i]].length * info.ppu,
//           ppu: info.ppu,
//           weight: weight(cart[pids[i]].length * info.wpu, info.mu),
//         };
//         cost.totals.price  += cost[pids[i]].price;
//         cost.totals.weight += cost[pids[i]].weight;
//         cost.totals.uniqueItems += 1;
//         cost.totals.items += cost[pids[i]].amount;
//         x(++i);
//       });
//     };
//     x(0);
//   },
//   purchaseCart(shopCart, cb) {
//     decodeCart(shopCart, (err, cart) => {
//       if (err) return cb(err);
//     });
//   },
// };
// export {ShoppingCart, decodeCart, encodeCart};
