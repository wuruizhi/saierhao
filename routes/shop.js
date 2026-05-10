const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const itemsData = require('../data/items.json');

function createShopRouter(db) {
  const router = express.Router();

  // Get shop items
  router.get('/list', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    // Get player inventory
    const inventory = db.prepare('SELECT * FROM player_items WHERE player_id = ?').all(player.id);
    const inventoryMap = {};
    inventory.forEach(i => { inventoryMap[i.item_id] = i.quantity; });

    res.json({
      capsules: itemsData.capsules,
      candies: itemsData.candies,
      boosters: itemsData.boosters || [],
      others: itemsData.others,
      wardrobe: itemsData.wardrobe || [],
      playerMoney: player.money,
      inventory: inventoryMap
    });
  });

  // Buy item
  router.post('/buy', authMiddleware, (req, res) => {
    const { itemId, quantity = 1 } = req.body;
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    // Find item in catalog
    const allItems = [
      ...itemsData.capsules, 
      ...itemsData.candies, 
      ...(itemsData.boosters || []), 
      ...itemsData.others, 
      ...(itemsData.wardrobe || [])
    ];
    const item = allItems.find(i => i.id === itemId);
    if (!item) return res.status(400).json({ error: '商品不存在' });

    const totalCost = item.price * quantity;
    if (player.money < totalCost) {
      return res.status(400).json({ error: `金币不足！需要 ${totalCost}💰，当前 ${player.money}💰` });
    }

    // Deduct money
    db.prepare('UPDATE players SET money = money - ? WHERE id = ?').run(totalCost, player.id);

    // Add to inventory
    const existing = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
    if (existing) {
      db.prepare('UPDATE player_items SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, itemId, quantity);
    }

    const updatedPlayer = db.prepare('SELECT money FROM players WHERE id = ?').get(player.id);
    res.json({
      success: true,
      message: `购买了 ${quantity}个 ${item.name}！`,
      playerMoney: updatedPlayer.money,
      itemId,
      newQuantity: (existing ? existing.quantity : 0) + quantity
    });
  });

  // Get inventory
  router.get('/inventory', authMiddleware, (req, res) => {
    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    const inventory = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND quantity > 0').all(player.id);
    const allItems = [
      ...itemsData.capsules, 
      ...itemsData.candies, 
      ...(itemsData.boosters || []), 
      ...itemsData.others,
      ...(itemsData.wardrobe || [])
    ];

    const items = inventory.map(inv => {
      const def = allItems.find(i => i.id === inv.item_id);
      return { ...inv, def };
    }).filter(i => i.def);

    res.json({ items, playerMoney: player.money });
  });

  return router;
}

module.exports = createShopRouter;
