class App::FavoriteController < ApplicationController
  skip_before_filter :verify_authenticity_token
  respond_to :json

  def all
    render json: Direction.all
  end

  #obtiene taxis favoritos de usuario
  def get_taxis
    taxis = []
    favorites = User.find(params[:user_id]).taxis
    favorites.each{|taxi| taxis.push({id: taxi.id, user_id: taxi.user_id, service_id:taxi.service_id, alias: taxi.alias, score: Service.find(taxi.service_id).score})}
    render json: {taxis: taxis}
  end
  #guardar taxista
  def save_taxi
    user = User.find_by(username: params[:username].downcase)
    if user
      driver = user.service
      unless Taxi.find_by(user_id: params[:user_id], service_id: driver.id)
        taxi = Taxi.new(user_id: params[:user_id], service_id: driver.id, alias: params[:alias])
        if taxi.save
          render json: taxi
        else
          render json: {errors: taxi.errors, message: 'Taxista can\'t be saved', saved: false}, status: 422
        end
      else
        render json: {errors: 'Taxista already saved', saved: true}, status: 422
      end
    else
      render json: {errors: 'Taxista can\'t be saved', saved: false}, status: 422
    end
  end

  #obtiene taxis favoritos de usuario
  def get_locations
    directions = User.find(params[:user_id]).directions

    render json: {directions: directions}
  end

  #guarda solicitud
  def save_location
    #directions = Direction.where(user_id: params[:user_id], latitud: params[:latitud], longitud: params[:longitud])
  	#if directions.count == 0
    unless Direction.find_by(user_id: params[:user_id], alias: params[:alias])
  		direction = Direction.new(user_id: params[:user_id], latitud: params[:latitud], longitud: params[:longitud], alias: params[:alias])
	  	if direction.save
	  		render json: direction
	  	else
	  		render json: {errors: direction.errors, message: 'Location can\'t be saved', saved: false}, status: 422
	  	end
  	else
  		render json: {message: 'Location already saved', saved: true}, status: 422
  	end
  end
  #obtener solicitud favorita
  def get_requests
    requests = User.find(params[:user_id]).request_favorites
    render json: {requests: requests}
  end
  #borrar taxi
  def delete_taxi
    taxi = Taxi.find(params[:id])
    if taxi && taxi.destroy
      render json: {message: 'Taxi deleted.', deleted: true}
    else
      render json: {message: 'Taxi no found', deleted: false}, status: 422
    end
  end
  #borrar ubicación
  def delete_location
    location = Direction.find(params[:id])
    if location && location.destroy
      render json: {message: 'Location deleted.', deleted: true}
    else
      render json: {message: 'Location no found', deleted: false}, status: 422
    end
  end
  #borrar solicitud favorito
  def delete_favorite
    favorite = RequestFavorite.find(params[:id])
    if favorite && favorite.destroy
      render json: {message: 'Request deleted.', deleted: true}
    else
      render json: {error: service.errors.full_messages, message: 'Request no found ' + params[:id], deleted: false}, status: 422
    end
  end

  def default_serializer_options
    {root: false}
  end
end
