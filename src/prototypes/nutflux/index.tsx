/**
 * @name NutFlux 视频流媒体APP
 * @mode axure
 *
 * 参考资料：
 * - /rules/development-guide.md
 * - /skills/axure-export-workflow/SKILL.md
 */

import React, { useState, useEffect } from 'react';
import './style.css';

// 示例数据
const mockVideos = [
  {
    video_id: '1',
    title: '2024最新科幻大片：星际穿越2',
    description: '一场跨越星际的冒险，探索未知的宇宙奥秘',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=science%20fiction%20movie%20poster%20space%20travel&image_size=landscape_16_9',
    duration: 9000,
    views: 1234567,
    likes: 98765,
    comments: 12345,
    category: '科幻',
    creator: {
      id: '101',
      name: 'NutFlux官方',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=streaming%20service%20logo&image_size=square',
      is_followed: true
    },
    stream_url: 'https://example.com/stream1.mp4',
    qualities: ['360p', '720p', '1080p', '4K'],
    subtitles: [
      { id: 'sub1', language: '中文', url: 'https://example.com/sub1.srt' },
      { id: 'sub2', language: '英文', url: 'https://example.com/sub2.srt' }
    ],
    is_liked: false,
    is_favorited: false
  },
  {
    video_id: '2',
    title: '2024年度动作大片：速度与激情11',
    description: '全球最受欢迎的动作系列电影最新力作',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=action%20movie%20poster%20fast%20cars&image_size=landscape_16_9',
    duration: 7200,
    views: 987654,
    likes: 76543,
    comments: 8765,
    category: '动作',
    creator: {
      id: '102',
      name: '环球影业',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=movie%20studio%20logo&image_size=square',
      is_followed: false
    },
    stream_url: 'https://example.com/stream2.mp4',
    qualities: ['360p', '720p', '1080p'],
    subtitles: [
      { id: 'sub1', language: '中文', url: 'https://example.com/sub1.srt' },
      { id: 'sub2', language: '英文', url: 'https://example.com/sub2.srt' }
    ],
    is_liked: true,
    is_favorited: true
  },
  {
    video_id: '3',
    title: '2024最新喜剧：疯狂动物城2',
    description: '动物城市的冒险继续，笑点不断',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=animated%20comedy%20movie%20poster%20animals&image_size=landscape_16_9',
    duration: 6000,
    views: 765432,
    likes: 54321,
    comments: 6543,
    category: '喜剧',
    creator: {
      id: '103',
      name: '迪士尼动画',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=disney%20animation%20logo&image_size=square',
      is_followed: true
    },
    stream_url: 'https://example.com/stream3.mp4',
    qualities: ['360p', '720p', '1080p'],
    subtitles: [
      { id: 'sub1', language: '中文', url: 'https://example.com/sub1.srt' },
      { id: 'sub2', language: '英文', url: 'https://example.com/sub2.srt' }
    ],
    is_liked: false,
    is_favorited: false
  },
  {
    video_id: '4',
    title: '2024最新纪录片：地球脉动3',
    description: '探索地球的自然奇观和生物多样性',
    thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=documentary%20poster%20nature%20earth&image_size=landscape_16_9',
    duration: 5400,
    views: 543210,
    likes: 43210,
    comments: 4321,
    category: '纪录片',
    creator: {
      id: '104',
      name: 'BBC纪录片',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bbc%20logo&image_size=square',
      is_followed: false
    },
    stream_url: 'https://example.com/stream4.mp4',
    qualities: ['360p', '720p', '1080p', '4K'],
    subtitles: [
      { id: 'sub1', language: '中文', url: 'https://example.com/sub1.srt' },
      { id: 'sub2', language: '英文', url: 'https://example.com/sub2.srt' }
    ],
    is_liked: true,
    is_favorited: false
  }
];

const categories = ['全部', '科幻', '动作', '喜剧', '纪录片', '动画', '悬疑', '恐怖'];

const Component: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [filteredVideos, setFilteredVideos] = useState<any[]>(mockVideos);

  useEffect(() => {
    // 根据分类和搜索过滤视频
    let result = mockVideos;
    if (selectedCategory !== '全部') {
      result = result.filter(video => video.category === selectedCategory);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(video => 
        video.title.toLowerCase().includes(query) ||
        video.description.toLowerCase().includes(query) ||
        video.creator.name.toLowerCase().includes(query)
      );
    }
    setFilteredVideos(result);
  }, [selectedCategory, searchQuery]);

  const handleVideoClick = (video: any) => {
    setSelectedVideo(video);
    setIsPlaying(true);
  };

  const handleLike = (videoId: string) => {
    setFilteredVideos(prev => prev.map(video => 
      video.video_id === videoId ? { ...video, is_liked: !video.is_liked, likes: video.is_liked ? video.likes - 1 : video.likes + 1 } : video
    ));
    if (selectedVideo && selectedVideo.video_id === videoId) {
      setSelectedVideo(prev => ({ ...prev, is_liked: !prev.is_liked, likes: prev.is_liked ? prev.likes - 1 : prev.likes + 1 }));
    }
  };

  const handleFavorite = (videoId: string) => {
    setFilteredVideos(prev => prev.map(video => 
      video.video_id === videoId ? { ...video, is_favorited: !video.is_favorited } : video
    ));
    if (selectedVideo && selectedVideo.video_id === videoId) {
      setSelectedVideo(prev => ({ ...prev, is_favorited: !prev.is_favorited }));
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="nutflux-app bg-gray-900 text-white min-h-screen">
      {/* 顶部导航栏 */}
      <header className="bg-gray-800 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-orange-500">NutFlux</h1>
        </div>
        <div className="flex items-center space-x-4">
          {currentTab === 'home' && (
            <div className="relative">
              <input
                type="text"
                placeholder="搜索视频、创作者..."
                className="bg-gray-700 text-white px-4 py-2 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium">用户</span>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-6">
        {/* 视频播放页 */}
        {selectedVideo && (
          <div className="mb-8">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              {/* 视频播放器 */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img src={selectedVideo.thumbnail} alt={selectedVideo.title} className="w-full h-full object-cover" />
                <button 
                  className="w-16 h-16 rounded-full bg-orange-500 bg-opacity-80 flex items-center justify-center"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {isPlaying ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {/* 播放控制栏 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button className="text-white hover:text-orange-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button 
                      className={`text-white hover:text-orange-500 ${selectedVideo.is_liked ? 'text-orange-500' : ''}`}
                      onClick={() => handleLike(selectedVideo.video_id)}
                    >
                      <svg className="w-6 h-6" fill={selectedVideo.is_liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="ml-1 text-sm">{formatNumber(selectedVideo.likes)}</span>
                    </button>
                    <button 
                      className={`text-white hover:text-orange-500 ${selectedVideo.is_favorited ? 'text-orange-500' : ''}`}
                      onClick={() => handleFavorite(selectedVideo.video_id)}
                    >
                      <svg className="w-6 h-6" fill={selectedVideo.is_favorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                    <button className="text-white hover:text-orange-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <button className="text-white hover:text-orange-500 mr-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => setVolume(parseInt(e.target.value))}
                        className="w-20 accent-orange-500"
                      />
                    </div>
                    <button className="text-white hover:text-orange-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* 视频信息 */}
            <div className="mt-4">
              <h2 className="text-xl font-bold">{selectedVideo.title}</h2>
              <div className="flex items-center text-gray-400 text-sm mt-2">
                <span>{formatNumber(selectedVideo.views)} 次观看</span>
                <span className="mx-2">•</span>
                <span>{formatDuration(selectedVideo.duration)}</span>
                <span className="mx-2">•</span>
                <span>{selectedVideo.category}</span>
              </div>
              {/* 创作者信息 */}
              <div className="flex items-center mt-4">
                <img src={selectedVideo.creator.avatar} alt={selectedVideo.creator.name} className="w-10 h-10 rounded-full mr-3" />
                <div className="flex-1">
                  <h3 className="font-medium">{selectedVideo.creator.name}</h3>
                  <p className="text-sm text-gray-400">1.2M 订阅者</p>
                </div>
                <button className={`px-4 py-2 rounded-full text-sm font-medium ${selectedVideo.creator.is_followed ? 'bg-gray-700' : 'bg-orange-500'}`}>
                  {selectedVideo.creator.is_followed ? '已关注' : '关注'}
                </button>
              </div>
              {/* 视频描述 */}
              <div className="mt-4 text-gray-300">
                <p>{selectedVideo.description}</p>
              </div>
              {/* 评论区 */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">评论 ({formatNumber(selectedVideo.comments)})</h3>
                <div className="mb-4">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">用户</span>
                    </div>
                    <input
                      type="text"
                      placeholder="添加评论..."
                      className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                {/* 评论列表 */}
                <div className="space-y-4">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">A</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium mr-2">用户A</h4>
                        <span className="text-xs text-gray-400">2小时前</span>
                      </div>
                      <p className="text-gray-300 mt-1">这部电影太精彩了！特效震撼，剧情紧凑。</p>
                      <div className="flex items-center mt-2 text-sm text-gray-400">
                        <button className="hover:text-orange-500 mr-4">👍 123</button>
                        <button className="hover:text-orange-500">回复</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">B</span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium mr-2">用户B</h4>
                        <span className="text-xs text-gray-400">5小时前</span>
                      </div>
                      <p className="text-gray-300 mt-1">演员的表演非常出色，推荐大家观看！</p>
                      <div className="flex items-center mt-2 text-sm text-gray-400">
                        <button className="hover:text-orange-500 mr-4">👍 89</button>
                        <button className="hover:text-orange-500">回复</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 首页/分类页内容 */}
        {!selectedVideo && (
          <>
            {/* 分类导航 */}
            <div className="flex overflow-x-auto pb-4 mb-6 space-x-4">
              {categories.map(category => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full whitespace-nowrap ${selectedCategory === category ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* 视频网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredVideos.map(video => (
                <div key={video.video_id} className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                  <div className="relative aspect-video">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium line-clamp-2">{video.title}</h3>
                    <div className="flex items-center mt-2">
                      <img src={video.creator.avatar} alt={video.creator.name} className="w-5 h-5 rounded-full mr-2" />
                      <p className="text-xs text-gray-400 truncate">{video.creator.name}</p>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-400">
                      <span>{formatNumber(video.views)} 次观看</span>
                      <span className="mx-1">•</span>
                      <span>2天前</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* 底部导航栏 */}
      <footer className="bg-gray-800 py-4 px-6 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around">
          <button 
            className={`flex flex-col items-center ${currentTab === 'home' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => setCurrentTab('home')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <span className="text-xs mt-1">首页</span>
          </button>
          <button 
            className={`flex flex-col items-center ${currentTab === 'explore' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => setCurrentTab('explore')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">发现</span>
          </button>
          <button 
            className={`flex flex-col items-center ${currentTab === 'library' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => setCurrentTab('library')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">库</span>
          </button>
          <button 
            className={`flex flex-col items-center ${currentTab === 'profile' ? 'text-orange-500' : 'text-gray-400'}`}
            onClick={() => setCurrentTab('profile')}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-xs mt-1">个人</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Component;