locals {
  latest_stable_ubuntu_image = "ubuntu-18-04-x64"
  latest_stable_caddy_image = "caddy-18-04"
  cheapest_droplet_size = "s-1vcpu-1gb"
}

resource "digitalocean_droplet" "main" {
  image = local.latest_stable_caddy_image
  size = local.cheapest_droplet_size
  name = "main"
  region = "nyc3"
  ssh_keys = [
    file(var.ssh_fingerprint_path)
  ]

  connection {
    host = self.ipv4_address
    user = "root"
    type = "ssh"
    private_key = file(var.ssh_private_key_path)
    timeout = "2m"
  }

  provisioner "remote-exec" {
    inline = [
      "mkdir /configure"
    ]
  }

  provisioner "file" {
    source = "configure"
    destination = "/"
  }
}

resource "digitalocean_domain" "agge" {
  name = "agge.dev"
  ip_address = digitalocean_droplet.main.ipv4_address
}

resource "digitalocean_record" "agge" {
  domain = digitalocean_domain.agge.name
  type = "A"
  name = "www"
  value = digitalocean_droplet.main.ipv4_address
}
