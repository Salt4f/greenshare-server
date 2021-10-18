const EMAIL_MIN_LENGTH = 6;
const EMAIL_MAX_LENGTH = 50;
const NICKNAME_MIN_LENGTH = 5;
const NICKNAME_MAX_LENGTH = 30;

function email(email) {
    if (email === undefined || !email) return false;
    const l = email.length;
    if (l < EMAIL_MIN_LENGTH || EMAIL_MAX_LENGTH < l) return false;
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function nickname(nickname) {
    if (nickname === undefined || !nickname) return false;
    const l = nickname.length;
    if (l < NICKNAME_MIN_LENGTH || NICKNAME_MAX_LENGTH < l) return false;

    return true;
}

function DNI(dni) {
    if (dni === undefined || !dni) return false;
    var numero, let, letra;
    var expresion_regular_dni = /^[XYZ]?\d{5,8}[A-Z]$/;

    dni = dni.toUpperCase();

    if (expresion_regular_dni.test(dni) === true) {
        numero = dni.substr(0, dni.length - 1);
        numero = numero.replace('X', 0);
        numero = numero.replace('Y', 1);
        numero = numero.replace('Z', 2);
        let = dni.substr(dni.length - 1, 1);
        numero = numero % 23;
        letra = 'TRWAGMYFPDXBNJZSQVHLCKET';
        letra = letra.substring(numero, numero + 1);
        if (letra != let) {
            //alert('Dni erroneo, la letra del NIF no se corresponde');
            return false;
        } else {
            //alert('Dni correcto');
            return true;
        }
    } else {
        //alert('Dni erroneo, formato no válido');
        return false;
    }
}

function password(password) {
    if (password === undefined || !password) return false;

    return true;
}

function underAge(birthday) {
    // it will accept two types of format yyyy-mm-dd and yyyy/mm/dd
    var optimizedBirthday = birthday.replace(/-/g, '/');

    //set date based on birthday at 00:00:00 hours (CET)
    var myBirthday = new Date(optimizedBirthday);

    // set current day on 00:00:00 hours (CET)
    var currentDate = new Date().toJSON().slice(0, 10) + ' 00:00:00';

    // calculate age comparing current date and borthday
    var myAge = ~~((Date.now(currentDate) - myBirthday) / 31557600000);

    if (myAge < 18) {
        return false;
    } else {
        return true;
    }
}

module.exports = {
    email,
    nickname,
    DNI,
    password,
    underAge,
};
