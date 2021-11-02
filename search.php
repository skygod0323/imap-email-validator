<?php 
    $imap_server = $_POST['imap_server'];
    $host = "{" . $imap_server . ":993/imap/ssl/novalidate-cert}INBOX";
    $username = $_POST['username'];
    $password = $_POST['password'];
    $searchKey = $_POST['searchKey'];

    

    try {
        $mbox = imap_open($host,$username,$password, NULL, 1, array('DISABLE_AUTHENTICATOR' => 'GSSAPI')) or die('Cannot connect: ' . imap_last_error());
        $MC = imap_check($mbox);
        
        $uids   = imap_search($mbox, 'TEXT "'.$searchKey.'"', SE_UID);
        
        if ($uids) {
            echo json_encode(array(
                'success' => true,
                'count' => count($uids)
            ));    
        } else {
            echo json_encode(array(
                'success' => false,
            ));    
        }
        
    } catch (Exception $e) {
        echo json_encode(array(
            'success' => false
        ));
    }

    // echo json_encode(array(
    //     'success' => true,
    //     'searchKey' => $searchKey
    // ));
?>