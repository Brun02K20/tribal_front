ALTER TABLE Productos
  ADD COLUMN es_unico BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE DetallePedidos
  ADD COLUMN disenos_urls JSON NULL;

CREATE TABLE Disenos (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  url_foto TEXT NULL,
  id_producto INT NOT NULL,
  PRIMARY KEY (id),
  INDEX idx_disenos_producto (id_producto),
  CONSTRAINT fk_disenos_productos
    FOREIGN KEY (id_producto) REFERENCES Productos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE Disenos
  MODIFY COLUMN url_foto TEXT NULL;

ALTER TABLE Disenos
  ADD COLUMN stock INT NOT NULL DEFAULT 0 AFTER precio;

INSERT INTO Disenos (nombre, precio, url_foto, id_producto)
SELECT
  p.nombre,
  p.precio,
  NULL,
  p.id
FROM Productos p
WHERE p.es_unico = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM Disenos d
    WHERE d.id_producto = p.id
  );

UPDATE Disenos d
INNER JOIN Productos p ON p.id = d.id_producto
SET d.stock = p.stock
WHERE p.es_unico = TRUE;

UPDATE Productos p
INNER JOIN (
  SELECT id_producto, SUM(stock) AS stock_total
  FROM Disenos
  GROUP BY id_producto
) ds ON ds.id_producto = p.id
SET p.stock = ds.stock_total
WHERE p.es_unico = FALSE;
