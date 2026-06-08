importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyCfGWJP7Y-zTIcPNaHmMO6CPS1GFz0R1Uo",
    authDomain: "notify-demo-3be73.firebaseapp.com",
    projectId: "notify-demo-3be73",
    storageBucket: "notify-demo-3be73.firebasestorage.app",
    messagingSenderId: "142312136181",
    appId: "1:142312136181:web:5ae90f6963f0676a0394bc",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log(
        '[firebase-messaging-sw.js] Background message',
        payload,
    );

    // const title = payload.data.title;

    const options = {
        body:
            payload.data.body,

        icon:
            payload.data.icon,
    };

    self.registration.showNotification(
        title,
        options,
    );
});

