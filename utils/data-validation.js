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

function password(_password) {
    if (_password === undefined || !_password) return false;

    return true;
}

function id(_id) {
    if (_id === undefined || !_id) return false;
    if (_id < 1) return false;

    return true;
}

function token(_token) {
    if (_token === undefined || !_token) return false;

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

function location(_location) {
    let passed = false;

    if (!_location) {
        return { passed };
    }
    let parsedLocation = _location.replace(',', '.').split(';');
    let latitude = parseFloat(parsedLocation[0]);
    let longitude = parseFloat(parsedLocation[1]);

    if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return { passed };
    }

    passed = true;

    return { passed };
}

function name(_name) {
    let passed = false;
    if (
        typeof _name !== 'string' ||
        _name === undefined ||
        !_name ||
        !isNaN(_name)
    ) {
        return { passed };
    }

    passed = true;

    return { passed };
}

function description(_description) {
    let passed = false;

    if (
        typeof _description !== 'string' ||
        _description === undefined ||
        !_description ||
        !isNaN(_description)
    ) {
        return { passed };
    }

    passed = true;

    return { passed };
}

function terminateAt(_terminateAt) {
    let passed = false;

    let currentDate = new Date();
    let paramDate = new Date(_terminateAt);

    if (
        !(paramDate instanceof Date && !isNaN(paramDate)) ||
        paramDate < currentDate ||
        !_terminateAt
    ) {
        return { passed };
    }

    passed = true;

    return { passed };
}
function tags(_tags) {
    let passed = false;

    if (!Array.isArray(_tags) || _tags.length == 0) {
        return { passed };
    }
    for (const tag of _tags) {
        if (typeof tag.name !== 'string' || !isNaN(tag.name)) {
            return { passed };
        }
    }

    passed = true;

    return { passed };
}

function icon(_icon) {
    let passed = false;

    if (_icon === undefined || _icon.length == 0) {
        return { passed };
    }

    passed = true;

    return { passed };
}

function photos(_photos) {
    let passed = false;

    if (
        _photos == undefined ||
        !Array.isArray(_photos) ||
        _photos.length == 0
    ) {
        return { passed };
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

    if (!name(_name).passed) {
        message = `invalid name`;
        return { passed, message };
    }
    if (!description(_description).passed) {
        message = `invalid description`;
        return { passed, message };
    }
    if (_terminateAt != undefined) {
        if (!terminateAt(_terminateAt).passed) {
            message = `invalid terminateAt date`;
            return { passed, message };
        }
    }
    if (_photos != undefined) {
        if (!photos(_photos).passed) {
            message = `invalid photos (not an array)`;
            return { passed, message };
        }
    }
    if (!location(_location).passed) {
        message = `invalid location`;
        return { passed, message };
    }
    if (!tags(_tags).passed) {
        message = `missing tag(s) field or invalid tag`;
        return { passed, message };
    }
    if (!icon(_icon).passed) {
        message = `missing icon`;
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
    if (!name(_name).passed) {
        message = `invalid name`;
        return { passed, message };
    }
    if (!description(_description).passed) {
        message = `invalid description`;
        return { passed, message };
    }
    if (_terminateAt != undefined) {
        if (!terminateAt(_terminateAt).passed) {
            message = `invalid terminateAt date`;
            return { passed, message };
        }
    }
    if (!location(_location).passed) {
        message = `invalid location`;
        return { passed, message };
    }
    if (!tags(_tags).passed) {
        message = `missing tag(s) field or invalid tag`;
        return { passed, message };
    }

    passed = true;
    message = `validation passed`;

    return { passed, message };
}

function register(_email, _password, _nickname, _dni, _birthDate, _fullName) {
    let passed = false;
    let message = '';

    if (email(_email) == false) {
        message = `Wrong parameters: invalid or missing email`;
        return { passed, message };
    }
    if (password(_password) == false) {
        message = `Wrong parameters: invalid or missing password`;
        return { passed, message };
    }
    if (nickname(_nickname) == false) {
        message = `Wrong parameters: invalid or missing nickname`;
        return { passed, message };
    }
    if (DNI(_dni) == false) {
        message = `Wrong parameters: invalid or missing dni`;
        return { passed, message };
    }
    if (underAge(_birthDate) == false) {
        message = `Wrong parameters: invalid birthDate or underAge`;
        return { passed, message };
    }
    if (!name(_fullName).passed) {
        message = `invalid fullName`;
        return { passed, message };
    }

    passed = true;
    message = 'validation passed';

    return { passed, message };
}

function login(_email, _password) {
    let passed = false;
    let message = '';

    if (email(_email) == false) {
        message = `Wrong parameters: invalid or missing email`;
        return { passed, message };
    }
    if (password(_password) == false) {
        message = `Wrong parameters: invalid or missing password`;
        return { passed, message };
    }

    passed = true;
    message = 'validation passed';

    return { passed, message };
}

function tokenValidation(_id, _token) {
    let passed = false;
    let message = '';

    if (!id(_id)) {
        message = `invalid id`;
        return { passed, message };
    }
    if (token(_token) == false) {
        message = `Wrong parameters: invalid or missing token`;
        return { passed, message };
    }

    passed = true;
    message = 'validation passed';

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
    icon,
    register,
    login,
    tokenValidation,
};
