import json

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'r') as f:
    story = json.load(f)

# Planet 11 is Stardust Abyss (Dark)
story['planets']['11']['steps'][0]['startDialogues'][0]['text'] = "星尘深处传来了不安的异响，某种古老的黑暗正在苏醒……你去陨石群中收集些星尘碎片，也许能找到线索。"
story['planets']['11']['steps'][1]['description'] = "在星屑回廊击败3只星尘浮游，收集星尘碎片。"
story['planets']['11']['steps'][2]['startDialogues'][0]['text'] = "不好！那是虚空行者的气息！他正试图打开连接虚无的通道，快去陨石荒原阻止他！"
story['planets']['11']['steps'][3]['startDialogues'][0]['text'] = "无知的光明……你们终将被虚无的黑洞所吞噬！"
story['planets']['11']['steps'][3]['endDialogues'][0]['text'] = "黑洞的引力竟然被……打散了。这不可能……"

# Planet 12 is Prism Planet (Light)
story['planets']['12']['steps'][0]['startDialogues'][0]['text'] = "这里的棱镜光线越来越刺眼了，似乎是有什么纯粹的光之生物在躁动。去清理一下周围暴走的晶棱角吧。"
story['planets']['12']['steps'][1]['description'] = "击败3只晶棱角，平息暴走的光芒。"
story['planets']['12']['steps'][2]['startDialogues'][0]['text'] = "感谢你平息了光芒。可是，耀光矩阵深处的光辉大天使似乎被某种力量折射出了狂暴的一面，快去看看！"
story['planets']['12']['steps'][3]['startDialogues'][0]['text'] = "审判之光将净化一切杂质！承受大天使的愤怒吧！"
story['planets']['12']['steps'][3]['endDialogues'][0]['text'] = "这刺眼的光芒……终于变得柔和了。谢谢你，勇敢的赛尔。"

# Planet 13 is Miasma Planet (Water/Poison)
story['planets']['13']['steps'][0]['startDialogues'][0]['text'] = "咳咳……沼泽里的毒瘴越来越浓了，连我的防毒面具都快撑不住了。去击退几只变异的污泥怪，让空气流通一下！"
story['planets']['13']['steps'][1]['description'] = "在腐坏沼泽击退3只污泥怪。"
story['planets']['13']['steps'][2]['startDialogues'][0]['text'] = "毒瘴的源头是那只古老的‘疫病之源’，它从沉睡中苏醒了！如果不阻止它，整个星球都会化为毒水！"
story['planets']['13']['steps'][3]['startDialogues'][0]['text'] = "咕噜咕噜……拥抱这甜美的瘟疫吧……"
story['planets']['13']['steps'][3]['endDialogues'][0]['text'] = "咳咳……瘟疫……也会有终结的一天吗……"

# Planet 14 is Phantom Sound (Normal/Sound)
story['planets']['14']['steps'][0]['startDialogues'][0]['text'] = "嘘……你听，风中的安魂曲。太悲伤了，连音符精灵们都开始哭泣。去安慰它们一下吧。"
story['planets']['14']['steps'][1]['description'] = "与3只音符精灵交手，平复它们悲伤的情绪。"
story['planets']['14']['steps'][2]['startDialogues'][0]['text'] = "那首绝望安魂曲是由‘夜莺’唱出的……她失去了声音的共鸣，只剩下绝望。用你的战斗唤醒她吧！"
story['planets']['14']['steps'][3]['startDialogues'][0]['text'] = "在这个没有回音的宇宙里……我的歌声……你听得到吗？"
story['planets']['14']['steps'][3]['endDialogues'][0]['text'] = "谢谢你……我终于听到了……充满希望的和弦……"

# Planet 15 is Rift of Time (Electric/Time)
story['planets']['15']['steps'][0]['startDialogues'][0]['text'] = "指针不动了！时间的齿轮卡壳了！发条鼠们到处乱窜，快帮我制止它们，不然整个时空都会崩溃！"
story['planets']['15']['steps'][1]['description'] = "击败3只发条鼠，收集散落的齿轮。"
story['planets']['15']['steps'][2]['startDialogues'][0]['text'] = "这些齿轮是用来修复时间引擎的！但是‘时光领主’已经开启了无限的时间循环，他想把这一刻永远定格！"
story['planets']['15']['steps'][3]['startDialogues'][0]['text'] = "你们的未来充满了毁灭，不如在无限的停滞中享受永恒吧！"
story['planets']['15']['steps'][3]['endDialogues'][0]['text'] = "时间的齿轮……终于又开始转动了。未来……真的值得期待吗……"

with open('/home/ubuntu/data2/vibe_coding/saierhao/data/story_quests.json', 'w', encoding='utf-8') as f:
    json.dump(story, f, ensure_ascii=False, indent=2)

print("Updated story quests.")
