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

function id(id) {
    if (id === undefined || !id) return false;
    if (id < 1) return false;

    return true;
}

function token(token) {
    if (token === undefined || !token) return false;

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

function location(location) {
    let passed = false;

    if (!location) {
        return { passed };
    }
    let parsedLocation = location.split(',');
    let latitude = parseFloat(parsedLocation[0]);
    let longitude = parseFloat(parsedLocation[1]);

    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return { passed};
    }
    
    passed = true;

    return { passed};
}

function name(name) {
    let passed = false;

    if (
        typeof name !== 'string' ||
        name === undefined ||
        !name ||
        !isNaN(name)
    ) {
        return { passed};
    }
    
    passed = true;

    return { passed };
}

function description(description) {
    let passed = false;

    if (
        typeof description !== 'string' ||
        description === undefined ||
        !description ||
        !isNaN(description)
    ) {
        return { passed };
    }
    
    passed = true;

    return { passed };
}

function terminateAt(terminateAt) {
    let passed = false;

    let currentDate = new Date();
    let paramDate = new Date(terminateAt);

    if (paramDate < currentDate || !terminateAt) {

        return { passed };
    }
   
    passed = true;

    return { passed};
}
function tags(tags) {
    let passed = false;

    if (tags.length == 0) {
        return { passed };
    }
    for (const tag of tags) {
        if (typeof tag.name !== 'string' || !isNaN(tag)) {
            return { passed };
        }
    }

    passed = true;

    return { passed };
}

function icon(icon) {
    let passed = false;

    if (icon === undefined || icon.length == 0) {
        return { passed};
    }

    passed = true;

    return { passed };
}

function photos(photos) {
    let passed = false;

    if (photos === undefined || photos.length == 0) {
        return {passed};
    }

    passed = true;

    return { passed };
}

function offer(
    _id,
    _name,
    _description,
    _terminateAt,
    _location,
    _icon,
    _photos,
    _tags
) {
    let passed = false;
    let message = '';

    if (!id(_id)) {
        message = `invalid id`;
        return { passed, message };
    }
    if (!name(_name)) {
        message = `invalid name`;
        return { passed, message };
    }
    if (!description(_description)) {
        message = `invalid description`;
        return { passed, message };
    }
    if (!terminateAt(_terminateAt)) {
        message = `invalid terminateAt date`;
        return { passed, message };
    }
    if (!location(_location)) {
        message = `invalid location`;
        return { passed, message };
    }
    if (!tags(_tags)) {
        message = `missing tag(s) field or invalid tag`;
        return { passed, message };
    }
    if (!icon(_icon)) {
        message = `missing icon`;
        return { passed, message };
    }
    if (!photos(_photos)) {
        message = `missing photos`;
        return { passed, message };
    }

    passed = true;
    message = `validation passed`;

    return { passed, message };
}

function request(_id, _name, _description, _terminateAt, _location, _tags) {
    let passed = false;
    let message = '';

    if (!id(_id)) {
        message = `invalid id`;
        return { passed, message };
    }
    if (!name(_name)) {
        message = `invalid name`;
        return { passed, message };
    }
    if (!description(_description)) {
        message = `invalid description`;
        return { passed, message };
    }
    if (!terminateAt(_terminateAt)) {
        message = `invalid terminateAt date`;
        return { passed, message };
    }
    if (!location(_location)) {
        message = `invalid location`;
        return { passed, message };
    }
    if (!tags(_tags)) {
        message = `missing tag(s) field or invalid tag`;
        return { passed, message };
    }

    passed = true;
    message = `validation passed`;

    return { passed, message };
}


module.exports = {
    email,
    nickname,
    DNI,
    password,
    underAge,
    id,
    token,
    offer,
    request,
    location,
    name,
    description,
    terminateAt,
    tags,
    photos,
    icon
};
