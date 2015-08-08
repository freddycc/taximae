class User < ActiveRecord::Base
	has_many :requests
	has_many :taxis
	has_many :directions
	has_many :reports
	has_many :request_favorites

	has_one :service

	validates :name,  presence: true
	validates :username,  presence: true
	
	has_secure_password
end