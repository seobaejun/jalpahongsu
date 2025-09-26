const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyBvQZvQZvQZvQZvQZvQZvQZvQZvQZvQZvQ',
  authDomain: 'hongsu3.firebaseapp.com',
  projectId: 'hongsu3',
  storageBucket: 'hongsu3.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456789'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDescriptions() {
  try {
    const querySnapshot = await getDocs(collection(db, 'experiences'));
    console.log('체험단 설명 확인:');
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.title}`);
      console.log(`   설명: ${data.description}`);
      console.log('');
    });
  } catch (error) {
    console.error('오류:', error);
  }
}

checkDescriptions();
