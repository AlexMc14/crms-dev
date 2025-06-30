import { db, storage } from '../firebase'; // Asegúrate de ajustar la ruta según tu estructura de archivos
import { collection, addDoc, getDocs, where, query, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, listAll, deleteObject, getMetadata, getStorage } from 'firebase/storage';

export async function moverClientesPorLlamar(id) {
    console.log('Llegoo');
    const clienteDocRef = doc(db, 'casos', id);
    // await updateDoc(clienteDocRef, caseWantSet.value);
    await updateDoc(clienteDocRef, {
        telEspecialista: null,
        status: null,
        confirmaCaso: '0',
    });
}

export async function moverCasoSinAsignar(id) {
    console.log('Llegoo');
    const clienteDocRef = doc(db, 'casos', id);
    // await updateDoc(clienteDocRef, caseWantSet.value);
    await updateDoc(clienteDocRef, {
        telEspecialista: null,
        status: '0',
        confirmaCaso: '1',
    });
}

export async function moverClientesSinPresupuesto(id) {
    const clienteDocRef = doc(db, 'casos', id);
    // await updateDoc(clienteDocRef, caseWantSet.value);
    await updateDoc(clienteDocRef, {
        status: '1',
        confirmaCaso: '1',
    });
}

export async function moverClientesPresupuestoPendiente(id) {
    const clienteDocRef = doc(db, 'casos', id);
    // await updateDoc(clienteDocRef, caseWantSet.value);
    await updateDoc(clienteDocRef, {
        status: '2',
    });
}

// async function moverClientePorLlamar (id) {
//     console.log('Llegoo');
//     const clienteDocRef = doc(db, 'casos', id);
//     // await updateDoc(clienteDocRef, caseWantSet.value);
//     await updateDoc(clienteDocRef, {
//         telEspecialista: null,
//         status: '0',
//     });
//     // receivedCase.telEspecialista = null;
//     // receivedCase.status = '0';
//     //   receivedCase.time = new Date().getTime();
//     //   if (receivedCase.confirmaCaso === '0') {
//     //     clientToEdit.value.confirmaCaso = '0'
//     //     clientEdited.value = clientToEdit.value
//     //     saveClientChange();
//     //   }
//     //   await addDoc(collection(db, 'casos'), receivedCase);
// }

// export const estados = [
//     moverClientePorLlamar,
//   ]