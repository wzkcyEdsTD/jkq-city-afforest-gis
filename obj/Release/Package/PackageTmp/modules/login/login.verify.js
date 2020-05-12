window.onload = loginLoad;

function loginLoad() {

    //是否有登录提示
    var msg = $.cookie('loginmsg');
    //var msg = "abc";
    if (msg) $('#logintooltip').html(msg);

    //登录按钮
    $('#btn-login').on('click', function () {
        var name = $('#username').val();
        if (name == '') {
            $('#username').focus();
            $('#logintooltip').html("请输入用户名");
            return;
        }
        var pwd = $('#userpwd').val();
        if (pwd == '') {
            $('#userpwd').focus();
            $('#logintooltip').html("请输入密码");
            return;
        }
        //$('#userpwd').val(hex_md5(pwd));
        $('#userpwd').val(pwd);
        $("#login-verify-url").val(Project_ParamConfig.defaultCoreServiceUrl);
        $(".form-login").submit();
    });

    $('#username').on('keypress', function (e) {
        if (e.charCode == 13) {
            var name = $('#username').val();
            if (name == '') {
                $('#username').focus();
                $('#logintooltip').html("请输入用户名");
            } else {
                $('#userpwd').val('');
                $('#userpwd').focus();
            }
        }
    });

    $('#userpwd').on('keypress', function (e) {
        if (e.charCode == 13) {
            var name = $('#username').val();
            if (name == '') {
                $('#username').focus();
            } else {
                var pwd = $('#userpwd').val();
                if (pwd == '') {
                    $('#userpwd').focus();
                    $('#logintooltip').html("请输入密码");
                } else {
                    $('#btn-login').click();
                }
            }
        }
    });
}
