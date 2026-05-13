const fs = require('fs');
const petsData = require('../data/pets.json');
const skillsData = require('../data/skills.json');

// Get all generic skills
const genericSkills = skillsData.skills.filter(s => !s.description.includes('专属') && !s.name.includes('专属'));

petsData.pets.forEach(pet => {
  if (pet.learnset.length < 8) {
    const existingSkillIds = new Set(pet.learnset.map(s => s.skillId));
    
    // Available skills: matching type or normal type
    const availableSkills = genericSkills.filter(s => 
      (s.type === pet.type || s.type === 'normal') && !existingSkillIds.has(s.id)
    );
    
    // Sort available skills by power (or ID) to somewhat match levels, or just shuffle
    availableSkills.sort((a, b) => (a.power || 0) - (b.power || 0));

    let needed = 8 - pet.learnset.length;
    
    let currentMaxLevel = Math.max(...pet.learnset.map(s => s.level));
    if (currentMaxLevel < 10) currentMaxLevel = 10;

    for (let i = 0; i < needed && availableSkills.length > 0; i++) {
      // pick a skill, starting from lower power
      const skill = availableSkills.shift();
      const nextLevel = currentMaxLevel + 5 + Math.floor(Math.random() * 5);
      
      pet.learnset.push({
        level: nextLevel,
        skillId: skill.id
      });
      currentMaxLevel = nextLevel;
    }
    
    // Re-sort learnset just in case
    pet.learnset.sort((a, b) => a.level - b.level);
  }
});

fs.writeFileSync('./data/pets.json', JSON.stringify(petsData, null, 2));
console.log('Successfully enriched pets learnsets!');
