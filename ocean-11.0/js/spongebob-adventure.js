// ========== 海绵宝宝冒险场景逻辑 ==========

let currentDialogueIndex = 0;
let userFishData = null;
let dialogueSequence = [];
let dialogueActive = false;
let adventureInitialized = false;

// 初始化冒险场景
function initSpongebobAdventure() {
    if (adventureInitialized) return;
    adventureInitialized = true;
    
    console.log('初始化海绵宝宝冒险场景...');
    
    // 安全检查：必须拥有海绵宝宝且未完成冒险
    const hasSpongebob = ownedItems && ownedItems.includes('spongebob');
    const hasCompletedAdventure = localStorage.getItem('spongebobAdventureCompleted') === 'true';
    
    console.log('检查条件:', { hasSpongebob, hasCompletedAdventure, ownedItems });
    
    if (!hasSpongebob) {
        alert('错误：未拥有海绵宝宝');
        goTo('sea');
        return;
    }
    
    if (hasCompletedAdventure) {
        alert('冒险已经完成过了！');
        goTo('sea');
        return;
    }
    
    // 获取用户最新画的小鱼
    userFishData = getUserLatestFish();
    
    if (!userFishData) {
        alert('你还没有画小鱼呢！先去画一条小鱼吧！');
        goTo('draw');
        return;
    }
    
    console.log('用户小鱼数据:', userFishData);
    
    // 设置对话序列
    dialogueSequence = [
        {
            speaker: 'spongebob',
            message: '嘿！新伙伴！(举着蟹黄堡模型蹦过来，身上还滴着水)要不要来蟹堡王当我的助手？我能教你做正宗蟹黄堡、炸酥脆薯条，还能带你参加水母捕捉大赛！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '蟹黄堡听起来就很诱人，当助手平时都要做些什么呀？',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '事情可多啦！要帮我准备食材、打扫后厨，忙完还能一起试吃新品，不过可不能让蟹老板知道！休息时我就带你去水母田，我有最厉害的水母网！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '听起来挺有意思的，那我答应你！',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '太棒了！我们现在就是最好的搭档！走，我现在就带你去后厨，偷偷把祖传蟹黄堡秘方告诉你，这可是我压箱底的本事！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '这么珍贵的秘方，蟹老板知道了不会生气吗？',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '放心！我藏得可好了！以后我们一起把蟹堡王发扬光大，每天还能顺路抓只水母当小宠物！',
            delay: 2000
        }
    ];
    
    // 设置用户小鱼在场景中
    setupUserFishInScene();
    
    // 绑定按钮事件 - 确保只绑定一次
    bindAdventureEvents();
    
        // 重置状态
    currentDialogueIndex = 0;
    dialogueActive = true;
    
    // ========== 修改：防止空白对话框闪现 ==========
    // 显示对话容器
    const dialogueContainer = document.querySelector('.dialogue-container');
    if (dialogueContainer) {
        dialogueContainer.classList.remove('hidden');
    }
    
    // 清除任何可能存在的旧对话
    const existingDialogueBoxes = document.querySelectorAll('.dialogue-box');
    existingDialogueBoxes.forEach(box => {
        box.classList.add('hidden');
    });
    
    // 立即开始对话
    showNextDialogue();


}

// 绑定冒险场景事件
function bindAdventureEvents() {
    console.log('绑定冒险场景事件...');
    
    // 移除可能存在的旧事件监听器
    const nextBtn = document.getElementById('nextDialogue');
    const skipBtn = document.getElementById('skipAdventure');
    const seaBtn = document.getElementById('goToSeaFromAdventure');
    
    // 克隆元素并替换以清除旧的事件监听器
    const replaceElement = (element) => {
        if (!element) return;
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    };
    
    // 替换元素
    const newNextBtn = replaceElement(nextBtn);
    const newSkipBtn = replaceElement(skipBtn);
    const newSeaBtn = replaceElement(seaBtn);
    
    // 绑定新事件
    if (newNextBtn) {
        newNextBtn.addEventListener('click', showNextDialogue);
    }
    
    if (newSkipBtn) {
        newSkipBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            skipAdventure();
        });
    }
    
    if (newSeaBtn) {
        newSeaBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            completeAdventure();
            goTo('sea');
        });
    }
}

// 获取用户最新画的小鱼
function getUserLatestFish() {
    if (!fishes || !Array.isArray(fishes)) {
        console.error('fishes 数组未定义或不是数组');
        return null;
    }
    
    const userFishes = fishes.filter(fish => {
        // 确保 fish 和 fish.id 存在
        if (!fish || !fish.id) return false;
        
        // 检查是否是商店角色
        if (typeof fish.id === 'string' && fish.id.startsWith('store_')) {
            return false;
        }
        
        // 检查是否是数字ID（用户画的小鱼）
        return typeof fish.id === 'number';
    });
    
    console.log('找到用户小鱼数量:', userFishes.length);
    
    if (userFishes.length === 0) {
        return null;
    }
    
    // 获取最新的一条小鱼（假设ID越大越新）
    const latestFish = userFishes.reduce((latest, current) => {
        return current.id > latest.id ? current : latest;
    });
    
    console.log('最新小鱼:', latestFish);
    
    return {
        id: latestFish.id,
        name: latestFish.name || '小鱼',
        story: latestFish.story || '一条可爱的小鱼',
        imgSrc: latestFish.img && latestFish.img.src ? latestFish.img.src : latestFish.img
    };
}

// 设置用户小鱼在场景中
function setupUserFishInScene() {
    const userFishContainer = document.querySelector('.character-user-fish');
    const spongebobContainer = document.querySelector('.character-spongebob');
    
    if (!userFishContainer || !spongebobContainer || !userFishData) {
        console.error('角色容器或数据缺失');
        return;
    }
    
    // 清空容器
    userFishContainer.innerHTML = '';
    spongebobContainer.innerHTML = '';
    
    // 创建海绵宝宝图片和名字
    const spongebobImg = document.createElement('img');
    spongebobImg.src = 'assets/spongebob.png';
    spongebobImg.alt = '海绵宝宝';
    spongebobImg.className = 'adventure-character';
    spongebobImg.style.objectFit = 'contain';
    
    const spongebobName = document.createElement('div');
    spongebobName.className = 'character-name';
    spongebobName.textContent = '海绵宝宝';
    
    spongebobContainer.appendChild(spongebobImg);
    spongebobContainer.appendChild(spongebobName);
    
    // 创建用户小鱼图片和名字
    const userFishImg = document.createElement('img');
    // 确保图片URL有效
    if (userFishData.imgSrc && userFishData.imgSrc.startsWith('data:')) {
        userFishImg.src = userFishData.imgSrc;
    } else {
        userFishImg.src = userFishData.imgSrc || 'assets/fish.png';
    }
    userFishImg.alt = userFishData.name;
    userFishImg.className = 'adventure-character user-fish';
    userFishImg.style.objectFit = 'contain';
    
    const userFishName = document.createElement('div');
    userFishName.className = 'character-name';
    userFishName.textContent = userFishData.name;
    
    userFishContainer.appendChild(userFishImg);
    userFishContainer.appendChild(userFishName);
    
    console.log('角色已添加到场景');
}


// 显示下一个对话 - 只保留最新两条对话，带有微信式滑动效果
function showNextDialogue() {
    console.log('显示下一个对话，当前索引:', currentDialogueIndex);
    
    if (!dialogueActive) return;
    
    if (currentDialogueIndex >= dialogueSequence.length) {
        console.log('对话已结束，进入海洋');
        completeDialogue();
        return;
    }
    
    const dialogue = dialogueSequence[currentDialogueIndex];
    console.log('当前对话:', dialogue);
    
    // 获取对话历史
    const dialogueHistory = dialogueSequence.slice(0, currentDialogueIndex + 1);
    
    // 只保留最新的两条对话
    const recentDialogues = dialogueHistory.slice(-2);
    console.log('最近两条对话:', recentDialogues);
    
    // 获取对话容器
    const dialogueContainer = document.querySelector('.dialogue-container');
    if (!dialogueContainer) {
        console.error('对话容器缺失');
        return;
    }
    
    // 优雅地移除旧对话
    const existingDialogues = dialogueContainer.querySelectorAll('.dialogue-box');
    const removePromises = [];
    
    existingDialogues.forEach((dialogue, index) => {
        const promise = new Promise((resolve) => {
            // 添加淡出效果
            dialogue.classList.add('fade-out');
            
            // 设置不同延迟，让旧对话依次淡出
            setTimeout(() => {
                if (dialogue.parentNode === dialogueContainer) {
                    dialogueContainer.removeChild(dialogue);
                }
                resolve();
            }, 150 + (index * 50)); // 依次淡出
        });
        removePromises.push(promise);
    });
    
    // 等所有旧对话都移除后，添加新对话
    Promise.all(removePromises).then(() => {
        // 清空容器
        dialogueContainer.innerHTML = '';
        
        // 创建并显示最近的两条对话
        recentDialogues.forEach((dialogueItem, index) => {
            const isSpongebob = dialogueItem.speaker === 'spongebob';
            const dialogueBox = document.createElement('div');
            dialogueBox.className = isSpongebob ? 'dialogue-box spongebob-dialogue' : 'dialogue-box userfish-dialogue';
            
            // 设置说话者名字
            const speakerElement = document.createElement('div');
            speakerElement.className = 'speaker';
            speakerElement.textContent = isSpongebob ? '海绵宝宝' : (userFishData ? userFishData.name : '你的小鱼');
            
            // 设置消息内容
            const messageElement = document.createElement('div');
            messageElement.className = 'message';
            messageElement.textContent = dialogueItem.message;
            
            // 如果是用户小鱼对话，内容右对齐
            if (!isSpongebob) {
                speakerElement.style.textAlign = 'left';
                messageElement.style.textAlign = 'left';
            }
            
            dialogueBox.appendChild(speakerElement);
            dialogueBox.appendChild(messageElement);
            
            // 设置初始状态（在下方，准备向上滑动）
            dialogueBox.style.opacity = '0';
            dialogueBox.style.transform = 'translateY(25px) scale(0.97)';
            dialogueBox.style.transition = 'opacity 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            
            dialogueContainer.appendChild(dialogueBox);
            
            // 使用requestAnimationFrame确保流畅动画
            requestAnimationFrame(() => {
                // 添加轻微延迟，实现依次出现的效果
                setTimeout(() => {
                    dialogueBox.style.opacity = '1';
                    dialogueBox.style.transform = 'translateY(0) scale(1)';
                }, index * 120); // 第二条对话稍晚出现
            });
        });
    });
    
    currentDialogueIndex++;
    
    // 如果是最后一个对话，隐藏所有按钮
    if (currentDialogueIndex >= dialogueSequence.length) {
        console.log('对话结束，准备进入海洋');
        const nextBtn = document.getElementById('nextDialogue');
        const skipBtn = document.getElementById('skipAdventure');
        const seaBtn = document.getElementById('goToSeaFromAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.add('hidden');
        
        // 等待3秒后自动跳转
        setTimeout(() => {
            completeDialogue();
        }, 3000);
    }
}
// 完成对话


function completeDialogue() {
    if (!dialogueActive) return;
    dialogueActive = false;
    
    console.log('完成对话序列');
    
    const spongebobDialogue = document.querySelector('.spongebob-dialogue');
    const userfishDialogue = document.querySelector('.userfish-dialogue');
    
    if (spongebobDialogue) spongebobDialogue.classList.add('hidden');
    if (userfishDialogue) userfishDialogue.classList.add('hidden');
    
    // 隐藏所有按钮
    const nextBtn = document.getElementById('nextDialogue');
    const skipBtn = document.getElementById('skipAdventure');
    const seaBtn = document.getElementById('goToSeaFromAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.add('hidden'); // 保持隐藏状态
    
    console.log('对话完成，准备进入海洋');
    
    // 延迟后自动进入海洋
    setTimeout(() => {
        completeAdventure();
        goTo('sea');
    }, 1000);
}

// 跳过冒险
function skipAdventure() {
    console.log('跳过冒险');
    if (confirm('确定要跳过海绵宝宝的冒险吗？')) {
        completeAdventure();
        goTo('sea');
    }
}

// 完成冒险
function completeAdventure() {
    console.log('完成冒险');
    
    // 标记冒险已完成
    localStorage.setItem('spongebobAdventureCompleted', 'true');
    
    // 确保海绵宝宝在海洋中可见
    if (fishes && Array.isArray(fishes)) {
        const spongebobFish = fishes.find(fish => fish && fish.id === 'store_spongebob');
        if (spongebobFish) {
            spongebobFish.hidden = false;
            // 更新海绵宝宝的故事，使其包含特殊对话
            spongebobFish.story = '我准备好了！我准备好了！让我们一起抓水母吧！嘿嘿嘿！';
            if (typeof saveFishes === 'function') {
                saveFishes();
            }
        }
    }
    
    // 奖励一些贝壳
    if (typeof addShells === 'function') {
        addShells(20);
    }
    
    console.log('冒险完成，获得奖励');
}

// 当页面加载时检查是否需要初始化冒险场景
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded - 海绵宝宝冒险场景');
    
    // 监听场景切换
    const originalGoTo = window.goTo;
    if (originalGoTo) {
        window.goTo = function(name) {
            console.log('切换到场景:', name);
            originalGoTo(name);
            
            // 如果是冒险场景，延迟初始化
            if (name === 'spongebobAdventure') {
                setTimeout(() => {
                    initSpongebobAdventure();
                }, 100);
            } else {
                // 重置初始化标志
                adventureInitialized = false;
            }
        };
    }
    
    // 检查当前是否在冒险场景
    const adventureScreen = document.getElementById('spongebobAdventure');
    if (adventureScreen && !adventureScreen.classList.contains('hidden')) {
        console.log('当前在冒险场景，初始化...');
        setTimeout(() => {
            initSpongebobAdventure();
        }, 500);
    }
});

// 添加全局访问
window.initSpongebobAdventure = initSpongebobAdventure;