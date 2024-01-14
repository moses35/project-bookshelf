import '../sass/components/_login-form.scss';
import Notiflix from 'notiflix';
import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  child,
  get,
  push,
  update,
  remove,
} from 'firebase/database';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBlGV3K7Sw7xSQRedD7xSUVb8ZeXIlohPE',
  authDomain: 'project-bookshelf-42f20.firebaseapp.com',
  databaseURL:
    'https://project-bookshelf-42f20-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'project-bookshelf-42f20',
  storageBucket: 'project-bookshelf-42f20.appspot.com',
  messagingSenderId: '182637264257',
  appId: '1:182637264257:web:101b116e14ac8fa2a8bc80',
};

initializeApp(firebaseConfig);
const auth = getAuth();
let userId = null;
let LOGIN = false;

Notiflix.Notify.init({
  position: 'right-bottom',
});

const menuHeader = document.querySelector('.js-list__nav');
const openSignUp = document.querySelector('[data-openSignUp]');
const modalBookBtn = document.querySelector('.modal__btn');
const modalBookBtnSignUp = document.querySelector('.modal-book-btn__signUp');
openSignUp.addEventListener('click', openSignUpFunc);

const mobileOut = document.querySelector('.mobile-menu--log-out');
const mobileMenu = document.querySelector('.js-mobile__nav');
const mobileEnter = document.querySelector('.mobile-menu__singin--link');
const userName = document.querySelector('.mobile-menu__user_name');
const mobileConteiner = document.querySelector('.mobile-menu__container');
const exit = document.querySelector('.exit');
mobileEnter.addEventListener('click', openSignUpFunc);

const logout = document.querySelector('[data-logOut]');
const log = document.querySelector('.log');
const iconShow = document.querySelector('.show__icon');

// log.addEventListener('click', signOutLog);
// logout.addEventListener('click', signOutLog);
mobileOut.addEventListener('click', signOutLog);
exit.addEventListener('click', signOutLog);
log.addEventListener('click', onClickExit);

function onClickExit() {
  exit.classList.toggle('exit_show');
}

function removeClass() {
  exit.classList.remove('exit_show');
}

const timer = {
  timeout: 5000,
};

if (localStorage.getItem('uid')) {
  userId = localStorage.getItem('uid');
}

onAuthStateChanged(auth, user => {
  if (user) {
    userId = user.uid;
    localStorage.setItem('uid', userId);
    //console.log('User signed in:', user);
    loginFunc(user.emailVerified);
  } else {
    localStorage.removeItem('uid');
    // localStorage.removeItem('user-name');
    LOGIN = false;
    loginFunc(null);
    //console.log('User signed out');
  }
});

async function createUser(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res;
}

async function signIn(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  return res;
}

function signOutLog() {
  signOut(auth);
  removeClass()
    .then(() => {
      localStorage.removeItem('uid');
      // localStorage.removeItem('user-name');
      LOGIN = false;
    })
    .catch(error => {});
}

function loginFunc(verified) {
  if (verified) {
    LOGIN = true;

    /*menuHeader.innerHTML =
      'ТЫ ЗАШЕЛ КРАСАВЧИК <button type="button" logOut>Log out</button>';*/

    menuHeader.classList.add('show');
    logout.classList.add('show');
    log.classList.add('show');
    openSignUp.classList.remove('show');
    // exit.classList.add('show');
    menuHeader.closest('.header__box').classList.add('autorizationstyle');
    if (modalBookBtnSignUp) {
      modalBookBtnSignUp.classList.add('is-hidden');
    }
    if (modalBookBtn) {
      modalBookBtn.classList.remove('is-hidden');
    }
    mobileOut.classList.add('show');
    mobileMenu.classList.add('show');
    mobileEnter.classList.remove('show');
    userName.classList.add('show');
    mobileConteiner.classList.add('show');
    iconShow.classList.add('show');
    if (localStorage.getItem('user-name')) {
      userName.textContent = localStorage.getItem('user-name');
      logout.textContent = localStorage.getItem('user-name');
    } else {
      userName.textContent = 'USER';
      logout.textContent = 'USER';
    }
    if (modalBookBtnSignUp) {
      modalBookBtnSignUp.classList.add('is-hidden');
    }
    if (modalBookBtn) {
      modalBookBtn.classList.remove('is-hidden');
    }

    //ДОБАВИть Функцию которая рендерит Хедер для пользователя регистрационных
  } else {
    LOGIN = false;
    //ДОБАВИть Функцию которая рендерит Хедер НЕ для регистрационных
    menuHeader.classList.remove('show');
    logout.classList.remove('show');
    log.classList.remove('show');
    // exit.classList.remove('.show')
    openSignUp.classList.add('show');
    menuHeader.closest('.header__box').classList.remove('autorizationstyle');
    if (modalBookBtnSignUp) {
      modalBookBtnSignUp.classList.remove('is-hidden');
    }
    if (modalBookBtn) {
      modalBookBtn.classList.add('is-hidden');
    }
    mobileOut.classList.remove('show');
    mobileMenu.classList.remove('show');
    mobileEnter.classList.add('show');
    mobileConteiner.classList.remove('show');
    userName.classList.remove('show');
    iconShow.classList.remove('show');
    if (modalBookBtnSignUp) {
      modalBookBtnSignUp.classList.remove('is-hidden');
    }
    if (modalBookBtn) {
      modalBookBtn.classList.add('is-hidden');
    }
  }
}

function checkLogin() {
  return LOGIN;
}

//Добавить книгу одну - жду тут обьект {  }
function postBook(obj) {
  if (LOGIN && userId) {
    const dbRef = ref(getDatabase(), `users/${userId}/${obj._id}`);
    update(dbRef, obj);
    return true;
  }
  return false;
}

//удалить книгу одну - жду тут айди книги
function deleteBook(id) {
  if (LOGIN && userId) {
    const dbRef = ref(getDatabase(), `users/${userId}/${id}`);
    remove(dbRef);
    return true;
  }
  return false;
}

//полуть список всех книг - ничего не жду)
async function getBook() {
  let res = null;

  await onAuthStateChanged(auth, user => {
    if (user) {
      userId = user.uid;
    }
  });

  await get(child(ref(getDatabase()), `users/${userId}`))
    .then(snapshot => {
      if (snapshot.exists()) {
        //console.log(snapshot.val());
        res = [...Object.values(snapshot.val())];
      } else {
        //console.log('No data available');
      }
    })
    .catch(error => {
      console.error(error);
    });
  return res;
}

const modalSignUp = document.querySelector('[data-modalSignUp]');
const modalForm = document.querySelector('[data-modalForm]');
const buttonSignUp = document.querySelector('[data-buttonSignUp]');
const buttonSignIn = document.querySelector('[data-buttonSignIn]');

modalSignUp.addEventListener('click', modalSignUpFunc);
modalForm.addEventListener('submit', modalFormFunc);
buttonSignUp.addEventListener('click', buttonSignUpFunc);
buttonSignIn.addEventListener('click', buttonSignInFunc);

let signUpBoll = false;

const collapsibles = document.querySelectorAll('.k-modal__input');
collapsibles.forEach(collapsible => {
  collapsible.addEventListener('input', e => {
    if (e.target.value) e.target.classList.add('hide-label');
    else e.target.classList.remove('hide-label');
  });
});

function showButtonActive(active, nActive) {
  active.classList.add('active');
  nActive.classList.remove('active');
}

function buttonSignUpFunc() {
  signUpBoll = true;
  showButtonActive(buttonSignUp, buttonSignIn);
  modalForm.elements.name.closest('.k-modal__block').style.display = 'block';
  modalForm.publish.textContent = 'Sign up';
}

function buttonSignInFunc() {
  signUpBoll = false;
  showButtonActive(buttonSignIn, buttonSignUp);
  modalForm.elements.name.closest('.k-modal__block').style.display = 'none';
  modalForm.publish.textContent = 'Sign In';
}

function openSignUpFunc() {
  modalSignUp.classList.add('k-modal--active');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', modalSignUpFuncKey);
}

function modalSignUpFunc(e) {
  if (e.target === e.currentTarget || e.target.closest('.k-modal__close'))
    closeModalForm();
}

function modalSignUpFuncKey(e) {
  if (e.code === 'Escape') closeModalForm();
}

function closeModalForm() {
  modalSignUp.classList.remove('k-modal--active');
  inputPass.type = 'password';
  document.body.style.overflow = 'overlay';
  document.removeEventListener('keydown', modalSignUpFuncKey);
}

function modalFormFunc(e) {
  e.preventDefault();
  const { name, email, password } = e.target.elements;

  if (!signUpBoll)
    return modalLoginFunc(email.value.toLowerCase(), password.value);

  if (name.value && email.value && password.value) {
    createUser(email.value.toLowerCase(), password.value)
      .then(userCredential => {
        console.log(userCredential);

        localStorage.setItem('user-name', name.value);
        modalForm.reset();
        collapsibles.forEach(collapsible => {
          collapsible.classList.remove('hide-label');
        });

        closeModalForm();
        sendEmail();
      })
      .catch(error => {
        console.log(error);
        Notiflix.Notify.failure('Случилась ошибка, повтори снова!');
      });
  } else {
    Notiflix.Notify.failure('Введите все поля!');
  }
}

function modalLoginFunc(email, password) {
  if (email && password) {
    signIn(email, password)
      .then(userCredential => {
        //console.log(userCredential);
        userId = userCredential.user.uid;

        localStorage.setItem('uid', userId);
        loginFunc(userCredential.user.emailVerified);

        modalForm.reset();
        collapsibles.forEach(collapsible => {
          collapsible.classList.remove('hide-label');
        });
        closeModalForm();
      })
      .catch(error => {
        console.log(error);
        Notiflix.Notify.failure('Неверный пароль или почта!');
      });
  } else {
    Notiflix.Notify.failure('Введите все поля!');
  }
}

function sendEmail() {
  sendEmailVerification(auth.currentUser).then(() => {
    console.log('SENT EMAIL => CHECK');
    Notiflix.Report.success(
      'Registration was successful!',
      'WARNING! Check your verification email',
      'Okay',
      timer
    );
    // Notiflix.Notify.success(
    //   'Успешно зарегистрировано, проверьте почту для верификации!',
    //   timer
    // );
  });
}

export { postBook, deleteBook, getBook, openSignUpFunc };

const iconPass = document.querySelector('.k-modal__icon[alt="lock"]');
const inputPass = document.querySelector('.k-modal__input[name="password"]');
//console.dir(inputPass);

iconPass.addEventListener('click', onClickIconPass);

function onClickIconPass() {
  if (inputPass.type === 'password') {
    inputPass.type = 'text';
  } else {
    inputPass.type = 'password';
  }
}

Notiflix.Report.init({
  success: {
    svgColor: '#4F2EE8',
    buttonBackground: '#4F2EE8',
    backOverlayColor: 'rgba(0,0, 0,0.2)',
  },
});
// Notiflix.Notify.init({
//   width: '300px',
//   borderRadius: '18px',
//   position: 'center-top',
//   closeButton: true,
//   fontFamily: 'DM Sans',
//   fontSize: '20px',
//   fontAwesomeIconSize: '38px',
//   distance: '30%',
//   success: {
//     background: '#4F2EE8',
//     textColor: '#fff',
//     notiflixIconColor: 'rgba(255,255,255,0.2)',
//   },
// });
