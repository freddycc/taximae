class App::RequestController < ApplicationController
  skip_before_filter :verify_authenticity_token
  respond_to :json

  def all
    render json: Request.all
  end
  #busca solicitud
  def find_request
  	request = Request.find_by(id: params[:request_id])
  	if request
  		render json: request
  	else
      render json: {error: 'Request not found.'}, status: 422
  	end
  end
  #obtener lista de solicitudes
  def get_requests
  	requests = []
    privates = []
    privates_end = []
    publics = []

  	service = User.find_by(id: params[:user_id]).service
  	if service
  		#solicitudes con el id del servicio del usuario
  		#requests = Request.where("(service_id = :service_id) or (service_id is null and service_type = 'ALL' and payment_method = 'ALL' and vehicle_type = 'ALL') or (service_id is null and service_type = 'ALL' and payment_method = 'ALL' and vehicle_type = :vehicle_type) or (service_id is null and service_type = 'ALL' and payment_method = :payment_method and vehicle_type = :vehicle_type) or (service_id is null and service_type = :service_type and payment_method = 'ALL' and vehicle_type = 'ALL') or (service_id is null and service_type = :service_type and payment_method = :payment_method and vehicle_type = 'ALL') or (service_id is null and service_type = 'ALL' and payment_method = :payment_method and vehicle_type = 'ALL') or (service_id is null and service_type = :service_type and payment_method = 'ALL' and vehicle_type = :vehicle_type) or (service_id is null and service_type = :service_type and payment_method = :payment_method and vehicle_type = :vehicle_type)",{service_id: service.id, service_type: service.service_type, payment_method: service.payment_method, vehicle_type: service.vehicle_type}).order('created_at DESC').limit(20)
      privates = Request.where("(service_id = :service_id and status='') or (service_id = :service_id and status='0') or (service_id = :service_id and status='1')",{service_id: service.id}).order('created_at DESC')
      privates_end = Request.where("(service_id = :service_id and status='2') or (service_id = :service_id and status='3')",{service_id: service.id}).order('created_at DESC').limit(20)
      publics = Request.where("(service_id is null and service_type = 'ALL' and payment_method = 'ALL' and vehicle_type = 'ALL') or (service_id is null and service_type = 'ALL' and payment_method = 'ALL' and vehicle_type = :vehicle_type) or (service_id is null and service_type = 'ALL' and payment_method = :payment_method and vehicle_type = :vehicle_type) or (service_id is null and service_type = :service_type and payment_method = 'ALL' and vehicle_type = 'ALL') or (service_id is null and service_type = :service_type and payment_method = :payment_method and vehicle_type = 'ALL') or (service_id is null and service_type = 'ALL' and payment_method = :payment_method and vehicle_type = 'ALL') or (service_id is null and service_type = :service_type and payment_method = 'ALL' and vehicle_type = :vehicle_type) or (service_id is null and service_type = :service_type and payment_method = :payment_method and vehicle_type = :vehicle_type)",{service_id: service.id, service_type: service.service_type, payment_method: service.payment_method, vehicle_type: service.vehicle_type}).order('created_at DESC').limit(20)
      requests = privates + privates_end + publics
  	else
  		requests = Request.where(user_id: params[:user_id]).order('created_at DESC').limit(20)
  	end
  	
  	render json: requests
  end
  #crear solicitud
  def create
    service = Service.find_by(id: params[:taxi])
    request = Request.new(user_id: params[:user_id], description: params[:description], service_type: params[:service_type], payment_method: params[:payment_method], vehicle_type: params[:vehicle_type], latitud: params[:latitud], longitud: params[:longitud], status: '')
    if service
      request.service_id = service.id
      request.payment_method = service.payment_method
      request.service_type = service.service_type
      request.vehicle_type = service.vehicle_type
    end
    
    if request.save
      if params[:saveFavorite]
        favorite = RequestFavorite.create(request_id: request.id, user_id: params[:user_id], alias: params[:alias])
      end
      render json: request
    else
      render json: {errors: request.errors.full_messages}, status: 422
    end
  end
  #crear solicitud a base de un favorito
  def create_favorite
    favorite = RequestFavorite.find(params[:request_id]).request
    request = Request.new(user_id: favorite.user_id, service_id: favorite.service_id, description: favorite.description, service_type: favorite.service_type, payment_method: favorite.payment_method, vehicle_type: favorite.vehicle_type, latitud: favorite.latitud, longitud: favorite.longitud, status: '')
    if request.save
      render json: request
    else
      render json: {errors: request.errors.full_messages}, status: 422
    end
  end
  #atención de solicitud
  def serve
    service = User.find(params[:user_id]).service
    request = Request.find(params[:request_id])
    if !request.service_id || request.service_id == '' || request.service_id == service.id
      request.service_id = service.id
      request.time = params[:time]
      request.status = '0';
      if request.save
        render json: request
      else
        render json: {errors: request.errors.full_messages}, status: 422
      end
    else
      render json: {errors: request.errors.full_messages, served: true}, status: 422
    end
  end
  #responder a una solicitud
  def respond_service
    request = Request.find(params[:request_id])
    if params[:response]
      request.status = '1'
    else
      request.status = '3'
    end

    if params[:cancel]
      request.status = '3'
    end

    if params[:finish]
      request.status = '2'
    end

    if request.save
      service = Service.find(request.service_id)
      requests_count = Request.where("service_id = :service_id and status != '' and status != '0'",{service_id: service.id}).count
      reports_count = Report.where(service_id: service.id).count

      score = 5-((5 * reports_count)/requests_count)
      service.score = score
      service.save
      render json: request
    else
      render json: {errors: request.errors.full_messages}, status: 422
    end 
  end
end
