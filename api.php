<?php 
    $imap_server = $_POST['imap_server'];
    $host = "{" . $imap_server . ":993/imap/ssl/novalidate-cert}";
    $username = $_POST['username'];
    $password = $_POST['password'];

    try {
        $inbox = imap_open($host,$username,$password);
        if ($inbox) {
            echo json_encode(array(
                'success' => true
            ));
        } else {
            echo json_encode(array(
                'success' => false
            ));
        }
        
    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false
        ));
    }
?>