const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const itemsData = require('../data/items.json');
const { incrementQuestProgress } = require('../game/quest-manager');

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
      furniture: itemsData.furniture || [],
      playerMoney: player.money,
      inventory: inventoryMap
    });
  });

  // Buy item
  router.post('/buy', authMiddleware, (req, res) => {
    const { itemId, quantity = 1 } = req.body;
    const buyQuantity = Number(quantity);
    if (!Number.isInteger(buyQuantity) || buyQuantity < 1) {
      return res.status(400).json({ error: '购买数量必须为正整数' });
    }

    const player = db.prepare('SELECT * FROM players WHERE user_id = ?').get(req.userId);
    if (!player) return res.status(404).json({ error: '玩家不存在' });

    // Find item in catalog
    const allItems = [
      ...itemsData.capsules, 
      ...itemsData.candies, 
      ...(itemsData.boosters || []), 
      ...itemsData.others, 
      ...(itemsData.wardrobe || []),
      ...(itemsData.furniture || [])
    ];
    const item = allItems.find(i => i.id === itemId);
    if (!item) return res.status(400).json({ error: '商品不存在' });

    const totalCost = item.price * buyQuantity;
    if (player.money < totalCost) {
      return res.status(400).json({ error: `金币不足！需要 ${totalCost}💰，当前 ${player.money}💰` });
    }

    // Execute as transaction
    db.transaction(() => {
      db.prepare('UPDATE players SET money = money - ? WHERE id = ?').run(totalCost, player.id);
      
      const existing = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
      if (existing) {
        db.prepare('UPDATE player_items SET quantity = quantity + ? WHERE id = ?').run(buyQuantity, existing.id);
      } else {
        db.prepare('INSERT INTO player_items (player_id, item_id, quantity) VALUES (?, ?, ?)').run(player.id, itemId, buyQuantity);
      }
      
      db.prepare('UPDATE players SET total_shop_buys = total_shop_buys + ? WHERE id = ?').run(buyQuantity, player.id);
      incrementQuestProgress(db, player.id, 'shop', 1);
    })();

    const existing = db.prepare('SELECT * FROM player_items WHERE player_id = ? AND item_id = ?').get(player.id, itemId);
    const updatedPlayer = db.prepare('SELECT money FROM players WHERE id = ?').get(player.id);
    res.json({
      success: true,
      message: `购买了 ${buyQuantity}个 ${item.name}！`,
      playerMoney: updatedPlayer.money,
      itemId,
      newQuantity: existing ? existing.quantity : 0
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
      ...(itemsData.wardrobe || []),
      ...(itemsData.furniture || [])
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
