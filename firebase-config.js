// Configuração ÚNICA do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBh3ZmJSlllOGdopvPj0dacRUK0RSCCjy4",
  authDomain: "endlessgameka.firebaseapp.com",
  databaseURL: "https://endlessgameka-default-rtdb.firebaseio.com",
  projectId: "endlessgameka",
  storageBucket: "endlessgameka.appspot.com",
  messagingSenderId: "489819955531",
  appId: "1:489819955531:web:a0d7627cd1acdca64288ce"
};

// Inicialização do Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

console.log("Firebase configurado com sucesso!");