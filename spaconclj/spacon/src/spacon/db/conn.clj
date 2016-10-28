(ns spacon.db.conn
  (:require [yesql.core :refer [defqueries]]
            [ragtime.jdbc :as jdbc]
            [ragtime.repl :as repl]
            [com.stuartsierra.component :as component]))

(def db-spec {:classname "org.postgresql.Driver"
              :subprotocol "postgresql"
              :subname "//localhost:5432/spacon"
              :user "spacon"
              :password "spacon"})

(defn loadconfig []
  {:datastore (jdbc/sql-database
                {:connection-uri "jdbc:postgresql://localhost:5432/spacon?user=spacon&password=spacon"})
   :migrations (jdbc/load-resources "migrations")})

(defn migrate [] (repl/migrate (loadconfig)))

(defn rollback [] (repl/rollback (loadconfig)))