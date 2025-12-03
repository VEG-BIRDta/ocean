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
            message: '哇哦！我准备好了！我准备好了！你是新来的小鱼朋友吗？',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '你好，海绵宝宝！我是' + userFishData.name + '，很高兴认识你！',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '太棒了！太棒了！我们可以一起抓水母吗？我最喜欢抓水母了！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '听起来很有趣！不过我不会抓水母，你能教我吗？',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '当然可以！首先，你要像我一样准备好！我准备好了！我准备好了！',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '然后，你要找到一只水母，慢慢地靠近它，再快速地...',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '啪！抓到啦！就像这样！嘿嘿嘿！',
            delay: 2000
        },
        {
            speaker: 'user',
            message: '哇，你真厉害！我也要试试看！',
            delay: 2000
        },
        {
            speaker: 'spongebob',
            message: '太好了！让我们一起冒险吧！我准备好了！我们现在就去海洋！',
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
    
    // 显示第一个对话
    setTimeout(() => {
        showNextDialogue();
    }, 500);
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

// 显示下一个对话
function showNextDialogue() {
    console.log('显示下一个对话，当前索引:', currentDialogueIndex);
    
    if (!dialogueActive) return;
    
    if (currentDialogueIndex >= dialogueSequence.length) {
        console.log('对话结束');
        completeDialogue();
        return;
    }
    
    const dialogue = dialogueSequence[currentDialogueIndex];
    console.log('当前对话:', dialogue);
    
    // 获取对话框元素
    const spongebobDialogue = document.querySelector('.spongebob-dialogue');
    const userfishDialogue = document.querySelector('.userfish-dialogue');
    const spongebobMessage = document.getElementById('spongebobMessage');
    const userFishMessage = document.getElementById('userFishMessage');
    
    if (!spongebobDialogue || !userfishDialogue || !spongebobMessage || !userFishMessage) {
        console.error('对话框元素缺失');
        return;
    }
    
    // 隐藏所有对话框
    spongebobDialogue.classList.add('hidden');
    userfishDialogue.classList.add('hidden');
    
    // 显示当前说话者的对话框
    if (dialogue.speaker === 'spongebob') {
        spongebobMessage.textContent = dialogue.message;
        spongebobDialogue.classList.remove('hidden');
        console.log('显示海绵宝宝对话');
    } else {
        userFishMessage.textContent = dialogue.message;
        userfishDialogue.classList.remove('hidden');
        console.log('显示用户小鱼对话');
    }
    
    currentDialogueIndex++;
    
    // 如果是最后一个对话，显示前往海洋的按钮
    if (currentDialogueIndex >= dialogueSequence.length) {
        console.log('显示前往海洋按钮');
        const nextBtn = document.getElementById('nextDialogue');
        const skipBtn = document.getElementById('skipAdventure');
        const seaBtn = document.getElementById('goToSeaFromAdventure');
        
        if (nextBtn) nextBtn.classList.add('hidden');
        if (skipBtn) skipBtn.classList.add('hidden');
        if (seaBtn) seaBtn.classList.remove('hidden');
        
        // 自动跳转
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
    
    // 显示完成提示
    const nextBtn = document.getElementById('nextDialogue');
    const skipBtn = document.getElementById('skipAdventure');
    const seaBtn = document.getElementById('goToSeaFromAdventure');
    
    if (nextBtn) nextBtn.classList.add('hidden');
    if (skipBtn) skipBtn.classList.add('hidden');
    if (seaBtn) seaBtn.classList.remove('hidden');
    
    console.log('对话完成，可以前往海洋');
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