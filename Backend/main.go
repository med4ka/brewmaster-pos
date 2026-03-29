package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/gin-gonic/gin"
	_ "modernc.org/sqlite"

	"github.com/midtrans/midtrans-go"
	"github.com/midtrans/midtrans-go/snap"
)

type Product struct {
	ID         int     `json:"id"`
	CategoryID int     `json:"category_id"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	Icon       string  `json:"icon"`
}

type CartItem struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
	Qty   int     `json:"qty"`
}

func main() {
	db, err := sql.Open("sqlite", "./brewmaster.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	initDB(db)

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/api/products", func(c *gin.Context) {
		rows, _ := db.Query("SELECT id, category_id, name, price, icon FROM products")
		defer rows.Close()
		var products []Product
		for rows.Next() {
			var p Product
			rows.Scan(&p.ID, &p.CategoryID, &p.Name, &p.Price, &p.Icon)
			products = append(products, p)
		}
		c.JSON(200, products)
	})

	r.POST("/api/products", func(c *gin.Context) {
		var p Product
		c.BindJSON(&p)
		res, _ := db.Exec("INSERT INTO products (category_id, name, price, icon) VALUES (?, ?, ?, ?)", p.CategoryID, p.Name, p.Price, "☕")
		id, _ := res.LastInsertId()
		p.ID = int(id)
		c.JSON(200, p)
	})

	r.PUT("/api/products/:id", func(c *gin.Context) {
		id := c.Param("id")
		var p Product
		c.BindJSON(&p)
		db.Exec("UPDATE products SET category_id = ?, name = ?, price = ? WHERE id = ?", p.CategoryID, p.Name, p.Price, id)
		c.JSON(200, gin.H{"message": "Sukses"})
	})

	r.DELETE("/api/products/:id", func(c *gin.Context) {
		id := c.Param("id")
		db.Exec("DELETE FROM products WHERE id = ?", id)
		c.JSON(200, gin.H{"message": "Sukses"})
	})

	
	midtrans.ServerKey = "SB-Mid-server-TUKAR_DENGAN_KEY_ASLI_LU"
	midtrans.Environment = midtrans.Sandbox

	r.POST("/api/checkout", func(c *gin.Context) {
		var req struct {
			Total float64    `json:"total"`
			Items []CartItem `json:"items"`
		}
		c.BindJSON(&req)

		orderID := fmt.Sprintf("ORD-%d", time.Now().Unix())

		db.Exec("INSERT INTO orders (order_id, total) VALUES (?, ?)", orderID, req.Total)
		for _, item := range req.Items {
			db.Exec("INSERT INTO order_items (order_id, product_name, quantity) VALUES (?, ?, ?)", orderID, item.Name, item.Qty)
		}

		reqSnap := &snap.Request{
			TransactionDetails: midtrans.TransactionDetails{OrderID: orderID, GrossAmt: int64(req.Total)},
		}

		snapResp, err := snap.CreateTransaction(reqSnap)

		var token string
		if err == nil && snapResp != nil {
			token = snapResp.Token
		}

		c.JSON(200, gin.H{"token": token, "order_id": orderID})
	})

	
	r.GET("/api/dashboard", func(c *gin.Context) {
		var todayRev, yesterdayRev float64
		var todayOrd, yesterdayOrd int

		
		db.QueryRow("SELECT COALESCE(SUM(total), 0), COUNT(id) FROM orders WHERE date(created_at, 'localtime') = date('now', 'localtime')").Scan(&todayRev, &todayOrd)
		db.QueryRow("SELECT COALESCE(SUM(total), 0), COUNT(id) FROM orders WHERE date(created_at, 'localtime') = date('now', '-1 day', 'localtime')").Scan(&yesterdayRev, &yesterdayOrd)

		
		revPct, ordPct := 0.0, 0.0
		if yesterdayRev > 0 {
			revPct = ((todayRev - yesterdayRev) / yesterdayRev) * 100
		} else if todayRev > 0 {
			revPct = 100.0
		}
		if yesterdayOrd > 0 {
			ordPct = float64(todayOrd-yesterdayOrd) / float64(yesterdayOrd) * 100
		} else if todayOrd > 0 {
			ordPct = 100.0
		}

		
		var bestItem string
		var bestQty int
		err := db.QueryRow(`SELECT oi.product_name, SUM(oi.quantity) as total_qty FROM order_items oi JOIN orders o ON oi.order_id = o.order_id WHERE date(o.created_at, 'localtime') = date('now', 'localtime') GROUP BY oi.product_name ORDER BY total_qty DESC LIMIT 1`).Scan(&bestItem, &bestQty)
		if err != nil {
			bestItem = "Belum Ada Data"
			bestQty = 0
		}

		
		rowsChart, _ := db.Query(`
			SELECT strftime('%w', created_at, 'localtime') as wday, SUM(total) 
			FROM orders 
			WHERE created_at >= date('now', '-6 days', 'localtime') 
			GROUP BY wday 
			ORDER BY wday ASC
		`)
		defer rowsChart.Close()

		chartData := make([]float64, 7) 
		for rowsChart.Next() {
			var wday int
			var tot float64
			rowsChart.Scan(&wday, &tot)
			chartData[wday] = tot 
		}

		
		rowsRec, _ := db.Query("SELECT order_id, total FROM orders ORDER BY id DESC LIMIT 3")
		defer rowsRec.Close()
		var recents []map[string]interface{}
		for rowsRec.Next() {
			var oid string
			var tot float64
			rowsRec.Scan(&oid, &tot)
			recents = append(recents, map[string]interface{}{"order_id": oid, "total": tot})
		}
		if recents == nil {
			recents = []map[string]interface{}{}
		}

		c.JSON(200, gin.H{
			"today_revenue":       todayRev,
			"revenue_pct":         revPct,
			"today_orders":        todayOrd,
			"orders_pct":          ordPct,
			"best_item":           bestItem,
			"best_qty":            bestQty,
			"chart_data":          chartData, 
			"recent_transactions": recents,
		})
	})

	
	r.GET("/api/orders", func(c *gin.Context) {
		rows, err := db.Query("SELECT order_id, total, created_at FROM orders ORDER BY id DESC")
		if err != nil {
			c.JSON(500, gin.H{"error": "Gagal ambil data order"})
			return
		}
		defer rows.Close()

		var orders []map[string]interface{}
		for rows.Next() {
			var orderID, createdAt string
			var total float64
			rows.Scan(&orderID, &total, &createdAt)

			itemRows, _ := db.Query("SELECT product_name, quantity FROM order_items WHERE order_id = ?", orderID)
			var items []map[string]interface{}
			for itemRows.Next() {
				var name string
				var qty int
				itemRows.Scan(&name, &qty)
				items = append(items, map[string]interface{}{"name": name, "qty": qty})
			}
			itemRows.Close()

			orders = append(orders, map[string]interface{}{
				"order_id":   orderID,
				"total":      total,
				"created_at": createdAt,
				"items":      items,
			})
		}

		if orders == nil {
			orders = []map[string]interface{}{}
		}
		c.JSON(200, orders)
	})

	fmt.Println("🚀 Server jalan di http://localhost:8080")
	r.Run(":8080")
}

func initDB(db *sql.DB) {
	db.Exec(`CREATE TABLE IF NOT EXISTS products ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "category_id" INTEGER, "name" TEXT, "price" REAL, "icon" TEXT);`)
	db.Exec(`CREATE TABLE IF NOT EXISTS orders ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "order_id" TEXT, "total" REAL, "created_at" DATETIME DEFAULT CURRENT_TIMESTAMP);`)
	db.Exec(`CREATE TABLE IF NOT EXISTS order_items ("id" INTEGER PRIMARY KEY AUTOINCREMENT, "order_id" TEXT, "product_name" TEXT, "quantity" INTEGER);`)

	var count int
	db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if count == 0 {
		db.Exec(`INSERT INTO products (category_id, name, price, icon) VALUES (1, 'Iced Americano', 25000, '☕'), (1, 'Caramel Macchiato', 38000, '🥛'), (2, 'Matcha Latte', 35000, '🍵'), (2, 'Butter Croissant', 22000, '🥐'), (1, 'Espresso Shot', 15000, '☕'), (2, 'Red Velvet', 32000, '🍰'), (1, 'Kopi Susu Gula Aren', 20000, '🥤');`)
	}
}
