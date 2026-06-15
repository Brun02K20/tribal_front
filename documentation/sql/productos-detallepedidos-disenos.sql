ALTER TABLE Productos
  ADD COLUMN es_unico BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE DetallePedidos
  ADD COLUMN disenos_urls JSON NULL;

CREATE TABLE Disenos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  url_foto TEXT NOT NULL,
  id_producto INT NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_disenos_producto (id_producto),
  CONSTRAINT fk_disenos_productos
    FOREIGN KEY (id_producto) REFERENCES Productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
