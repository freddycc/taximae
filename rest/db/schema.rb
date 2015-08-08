# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150704032545) do

  create_table "conversations", force: true do |t|
    t.integer  "user_id"
    t.integer  "request_id"
    t.integer  "message_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "conversations", ["message_id"], name: "index_conversations_on_message_id", using: :btree
  add_index "conversations", ["request_id"], name: "index_conversations_on_request_id", using: :btree
  add_index "conversations", ["user_id"], name: "index_conversations_on_user_id", using: :btree

  create_table "directions", force: true do |t|
    t.integer  "user_id"
    t.string   "latitud"
    t.string   "longitud"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "alias"
  end

  add_index "directions", ["user_id"], name: "index_directions_on_user_id", using: :btree

  create_table "messages", force: true do |t|
    t.string   "message"
    t.string   "message_type"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "reports", force: true do |t|
    t.integer  "user_id"
    t.integer  "service_id"
    t.string   "detail"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "request_id"
  end

  add_index "reports", ["request_id"], name: "index_reports_on_request_id", using: :btree
  add_index "reports", ["service_id"], name: "index_reports_on_service_id", using: :btree
  add_index "reports", ["user_id"], name: "index_reports_on_user_id", using: :btree

  create_table "request_favorites", force: true do |t|
    t.string   "alias"
    t.integer  "user_id"
    t.integer  "request_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "request_favorites", ["request_id"], name: "index_request_favorites_on_request_id", using: :btree
  add_index "request_favorites", ["user_id"], name: "index_request_favorites_on_user_id", using: :btree

  create_table "requests", force: true do |t|
    t.integer  "user_id"
    t.integer  "service_id"
    t.string   "service_type"
    t.string   "payment_method"
    t.string   "vehicle_type"
    t.float    "latitud"
    t.float    "longitud"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "description"
    t.string   "status"
    t.integer  "time"
  end

  add_index "requests", ["service_id"], name: "index_requests_on_service_id", using: :btree
  add_index "requests", ["user_id"], name: "index_requests_on_user_id", using: :btree

  create_table "services", force: true do |t|
    t.integer  "user_id"
    t.string   "service_type"
    t.string   "payment_method"
    t.string   "vehicle_type"
    t.integer  "score"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "distance_range"
  end

  add_index "services", ["user_id"], name: "index_services_on_user_id", using: :btree

  create_table "taxis", force: true do |t|
    t.integer  "user_id"
    t.integer  "service_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "alias"
  end

  add_index "taxis", ["service_id"], name: "index_taxis_on_service_id", using: :btree
  add_index "taxis", ["user_id"], name: "index_taxis_on_user_id", using: :btree

  create_table "users", force: true do |t|
    t.string   "name"
    t.string   "email"
    t.string   "phone"
    t.string   "user_type"
    t.string   "security"
    t.string   "status"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "username"
    t.string   "password_digest"
  end

end
