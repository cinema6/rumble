# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # All Vagrant configuration is done here. The most common configuration
  # options are documented and commented below. For a complete reference,
  # please see the online documentation at vagrantup.com.

  config.vm.hostname = "glickm"

  # Every Vagrant virtual environment requires a box to build off of.
  config.vm.box = "Berkshelf-CentOS-6.3-x86_64-minimal"

  # The url from where the 'config.vm.box' box will be fetched if it
  # doesn't already exist on the user's system.
  config.vm.box_url = "https://s3.amazonaws.com/c6.dev/VagrantBoxes/Berkshelf-CentOS-6.3-x86_64-minimal.box"

  config.vm.network :private_network, ip: "33.33.33.20"

  config.vm.boot_timeout = 180
  config.omnibus.chef_version = :latest
  config.berkshelf.enabled = true

  config.vm.provision :chef_solo do |chef|
    chef.data_bags_path = "./server/data_bags"
    chef.encrypted_data_bag_secret_key_path = "#{ENV['HOME']}/.chef/c6data.pem"
    chef.environments_path = "./server/environments"
    chef.environment = "Development"

    chef.json = {
        :c6mongo => {
            :users => {
                :ids => ["evan","howard","content","auth","vote"]
            },
            :cfg => {
                :auth => true
            }
        },
        :auth => {
            :source => {
                :branch => "master",
            },
            :cfg => {
                :loglevel => "trace"
            },
            :mongo => {
                :host => 'localhost'
            },
            :secrets => {
                :cookieParser => "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ,
                :mongoCredentials => {
                    :user => "auth",
                    :password => "password"
                }
            }
        },
        :content => {
            :source => {
                :branch => "master",
            },
            :cfg => {
                :loglevel => "trace"
            },
            :mongo => {
                :host => 'localhost'
            },
            :secrets => {
                :cookieParser => "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ,
                :mongoCredentials => {
                    :user => "content",
                    :password => "password"
                }
            }
        },
        :vote => {
            :source => {
                :branch => "master",
            },
            :cfg => {
                :loglevel => "trace"
            },
            :mongo => {
                :host => 'localhost'
            },
            :secrets => {
                :cookieParser => "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ,
                :mongoCredentials => {
                    :user => "vote",
                    :password => "password"
                }
            }
        }
    }

    chef.run_list = [
        "recipe[c6mongo]",
        "recipe[auth]",
        "recipe[content]",
        "recipe[vote]"
    ]

  end
end
