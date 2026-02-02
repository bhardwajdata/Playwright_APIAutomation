
module.exports = [
  {
    name: 'Get Products',
    url: 'https://dummyjson.com/products',
    method: 'GET',
    runs: 20,
    thresholds: { avg: 2500, p95: 2800, max: 3000 }
  },

  {
    name: 'Get Bookings',
    url: 'https://restful-booker.herokuapp.com/booking',
    method: 'GET',
    runs: 1,
    thresholds: { avg: 3500, p95: 3800, max: 4000 }
  },

/*  {
    name: 'Create User',
    url: 'https://api.example.com/users',
    method: 'POST',
    payload: { name: 'John', role: 'admin' },
    runs: 30,
    thresholds: {
      avg: 700,
      p95: 1200,
      max: 1500
    }
  }  */
];
