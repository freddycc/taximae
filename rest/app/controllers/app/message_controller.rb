class App::MessageController < ApplicationController

  skip_before_filter :verify_authenticity_token
  respond_to :json
  def all
  end

  #Obtiene los mensajes de una solicitud y los que puede mandar el usuario
  def get_messages
  	user = User.find(params[:user_id]);
  	if user
  		messages = Message.where(message_type: user.user_type)
  		conversation = Conversation.where(request_id: params[:request_id])
      texts = []
      conversation.each{ |msg| texts.push(Message.find_by(id: msg.message_id) ? Message.find(msg.message_id) : {})}
  		render json: {messages: messages, conversation: conversation, texts: texts}
  	else
		render json: {error: 'User not found.'}
  	end
  end

  #Envia un nuevo mensaje
  def send_message
  	user = User.find(params[:user_id]);
  	if user
  		message = Conversation.new(user_id: params[:user_id], message_id: params[:message_id], request_id: params[:request_id])
  		if message.save
  			conversation = Conversation.find_by(request_id: params[:request_id])
  			render json: conversation
  		end
  	else
		render json: {error: 'User not found.'}
  	end
  end
end
