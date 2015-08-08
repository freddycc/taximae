class App::ReportsController < ApplicationController
  skip_before_filter :verify_authenticity_token
  respond_to :json
  def all
  end
  #agregar reporte
  def add_report
  	request = Request.find(params[:request_id])
    
  	report = Report.new(request_id: params[:request_id],user_id: params[:user_id], service_id: request.service_id, detail: params[:detail])
  	if report.save
      service = Service.find(request.service_id)
      requests_count = Request.where("service_id = :service_id and status != '' and status != '0'",{service_id: service.id}).count
      reports_count = Report.where(service_id: service.id).count

      score = 5-((5 * reports_count)/requests_count)
      service.score = score
      service.save
  		render json: report
  	else
  		render json: {errors: 'Report can\'t be saved'}, status: 422
  	end
  end
  #actualizar puntos de taxista
  def update_score
    service = Service.find(params[:service_id])
    requests_count = Request.where("service_id = :service_id and status != '' and status != '0'",{service_id: service.id}).count
    reports_count = Report.where(service_id: service.id).count

    score = 5-((5 * reports_count)/requests_count)
    service.score = score
    
    if service.save
      render json: service
    else
      render json: {errors: service.errors.full_messages}, status: 422
    end
  end
  #obtener reporte
  def get_report
  	#request = Request.find(params[:request_id])
  	report = Report.find_by(request_id: params[:request_id])
  	
  	render json: report
  end
end
