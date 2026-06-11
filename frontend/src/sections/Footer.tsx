import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[#333333]/40 pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-white text-lg">RMO-Ai</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              建筑行业AI智能分析平台，<br />
              将二十年专业经验产品化。
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">产品</h4>
            <ul className="space-y-3">
              {['项目智能中心', 'AI设计代理', '建筑知识库', '设计师网络'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">资源</h4>
            <ul className="space-y-3">
              {['帮助文档', 'API接口', '更新日志', '案例研究'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">联系我们</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Mail size={18} />
              </a>
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Github size={18} />
              </a>
              <a href="#" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#333333]/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600">
            &copy; 2026 RMO-Ai. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              隐私政策
            </a>
            <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              服务条款
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
