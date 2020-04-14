variable "api_token_path" {}
variable "ssh_private_key_path" {}
variable "ssh_fingerprint_path" {}

provider "digitalocean" {
  token = file(var.api_token_path)
}
