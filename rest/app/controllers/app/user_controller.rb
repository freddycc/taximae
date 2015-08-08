class App::UserController < ApplicationController
  skip_before_filter :verify_authenticity_token
  respond_to :json
  def all
  	render json: User.all
  end

  #Registro de usuario
  def register
    username = params[:username].downcase
    if User.find_by(username: username)
      render json: {errors: 'Already exist', saved: true}, status: 422
    else
      user = User.new(name: params[:name], phone: params[:phone], 
      email: params[:email], user_type: params[:user_type], 
      security: params[:security], status: 'f', 
      username: username, password: params[:password],
      password_confirmation: params[:password_confirmation])
      if user.save
        if user.user_type == 'taxi_role'
          service = Service.new(user_id: user.id, service_type: params[:service_type],
          payment_method: params[:payment_method], vehicle_type: params[:vehicle_type], score: 5)
          if service.save
            render json: user
          else
            render json: {errors: service.errors.full_messages}, status: 422
          end
        else
          render json: user
        end
      else
        render json: {errors: user.errors.full_messages}, status: 422
      end  
    end
  	
  end

  #Autenticación de usuario
  def login
    user = User.find_by(username: params[:username].downcase).try(:authenticate, params[:password])
    if user
      render json: user
    else
      render json: {error: 'login failed'}, status: 406
    end
  end

  #Actualizacion de información del taxista
  def update
    @status = []
    user = User.find(params[:user_id])
    if user
      user.phone = params[:phone]
      user.security = params[:security]

      unless user.save
        @status.push('User can\'t be saved.')
      end

      service = user.service
      if service
        service.service_type = params[:service_type]
        service.payment_method = params[:payment_method]
        service.vehicle_type = params[:vehicle_type]
        
        unless service.save
          @status.push('Service can\'t be saved.')
        end
      end
    else
      @status.push('User no found.')
    end

    #Response
    if @status.length == 0
      render json: user
    else
      render json: {error: @status}, status: 422
    end
  end

  #Obtener servicio de usaurio
  def service
    service = Service.find_by(user_id:params[:user_id])
    if service
      render json: service
    else
      render json: {errors: ['Service no found.']}, status: 422
    end
  end

  def send_email
    ActionCorreo.bienvenido_email('freddy@centaurosolutions.com').deliver
    render json: {send: true}
  end

  #Configurar Rango de solicitudes

  def default_serializer_options
  	{root: false}
  end
end
