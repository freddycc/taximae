class Service < ActiveRecord::Base
	has_many :reports
	has_many :requests

	belongs_to :user

	validates :user_id,  presence: true
	validates :service_type,  presence: true
	validates :payment_method,  presence: true
	validates :vehicle_type,  presence: true
end
