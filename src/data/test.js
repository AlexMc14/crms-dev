import * as firebase from 'firebase/app'
import 'firebase/firestore'

export function all() {
    const database = firebase.firestore();
    database.collection('especialides').onSnapshot((snapshot)=>{
        // snapshot.docs('especialidades')
        console.log(snapshot.docs)
    })
}