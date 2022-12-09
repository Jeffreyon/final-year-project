
function validate(){
    return {
        validateEmail: function(email){
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        },
        validatePassword: function(password) {
            return password.length >= 8;
        },
        validatePhone: function(phoneNumber) {
            return phoneNumber.length == 11;
        }
    }
}

$('form#auth-form').submit(function (evt) {
    var {validateEmail, validatePassword, validatePhone} = validate();

    if (!validateEmail($('#email').val())) {
        evt.preventDefault();
        $('#emailError').text("Invalid email").css('color', 'red');
    } else $('#emailError').text("");
    if (!validatePassword($('#password').val())) {
        evt.preventDefault();
        $('#passError').text("Password must be more than 8 characters").css('color', 'red');
    } else $('#passError').text("");
    if (!validatePhone($('#phoneNumber').val())) {
        evt.preventDefault();
        $('#phoneNumberError').text("Invalid phone number!").css('color', 'red');
    } else $('#phoneNumberError').text("");
});

$(document).ready(function () {
    $('#showPassword').click(function (evt) {
        evt.preventDefault()
        $('#showPassword > svg').each(function () {
            $(this).toggle(100);
        })
        if ($('#password').attr('type') == 'password') $('#password').attr('type', 'text');
        else $('#password').attr('type', 'password');
    });
})