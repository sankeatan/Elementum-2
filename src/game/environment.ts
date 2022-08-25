// export const environment = {
//   production: true,
//   title: "Prod",
//   serverURL: "https://hogbod.dev",
//   IoConnectionOptions: {
//     reconnectionDelay: 100,
//     reconnection: true,
//     reconnectionAttemps: 100,
//     transports: ['websocket', 'polling']
//   }
// }

export const environment = {
  production: false,
  title: "Dev",
  serverURL: "http://localhost:3000",
  IoConnectionOptions: {
    reconnectionDelay: 100,
    reconnection: true,
    reconnectionAttemps: 100,
    transports: ['websocket', 'polling']
  }
}
