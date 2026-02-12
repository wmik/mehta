export default function Home() {
  return (
    <div className="relative min-h-screen bg-white font-mono overflow-x-hidden">
      {/* Grid Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-8">
        {/* Navigation */}
        <nav className="flex justify-between items-center py-8 border-b-2 border-black">
          <div className="text-lg font-bold tracking-tighter uppercase">
            Shamiri /// Copilot
          </div>
          <ul className="flex gap-12 list-none">
            {['Features', 'Process', 'About'].map((item, idx) => (
              <li key={idx}>
                <a
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-black no-underline text-xs uppercase tracking-wider relative
                    after:content-[''] after:absolute after:-bottom-1.25 after:left-0 
                    after:w-0 after:h-0.5 after:bg-black after:transition-all after:duration-300
                    hover:after:w-full"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Hero Section */}
        <section className="py-32 relative">
          <div className="inline-block px-4 py-2 border-2 border-black mb-12 text-xs tracking-wider uppercase">
            AI-Powered Session Review
          </div>

          <h1
            className="relative text-[clamp(4rem,12vw,9rem)] font-black leading-[0.9] mb-8 
            tracking-tighter uppercase
            after:content-[''] after:absolute after:w-full after:h-2 after:bg-black 
            after:bottom-[30%] after:left-0 after:-rotate-2"
          >
            AMPLIFY
            <br />
            SUPERVISION
          </h1>

          <p className="text-[clamp(1rem,2vw,1.2rem)] text-gray-600 max-w-2xl mb-16 leading-relaxed font-sans">
            Review therapy sessions 10x faster with AI-driven insights, safety
            detection, and quality scoring—designed for scale.
          </p>

          <div className="flex gap-8 flex-wrap">
            <a
              href="#"
              className="px-12 py-4 text-xs font-bold border-3 border-black 
                bg-black text-white no-underline uppercase tracking-wider font-mono
                relative overflow-hidden transition-colors duration-200
                before:content-[''] before:absolute before:top-0 before:-left-full 
                before:w-full before:h-full before:bg-white before:transition-all before:duration-300
                hover:before:left-0 hover:text-black"
            >
              <span className="relative z-20">Start Trial</span>
            </a>
            <a
              href="#"
              className="px-12 py-4 text-xs font-bold border-3 border-black 
                bg-transparent text-black no-underline uppercase tracking-wider font-mono
                relative overflow-hidden transition-colors duration-200
                before:content-[''] before:absolute before:top-0 before:-left-full 
                before:w-full before:h-full before:bg-black before:transition-all before:duration-300
                hover:before:left-0 hover:text-white"
            >
              <span className="relative z-20">View Demo</span>
            </a>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-32 border-t-2 border-black">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black mb-20 uppercase tracking-tighter">
            BUILT FOR
            <br />
            TIERED CARE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 border-3 border-black">
            {[
              {
                icon: 'AI',
                title: 'Session Analysis',
                desc: 'Automatically generate structured insights from 40-60 minute therapy sessions, including summaries and quality scores.'
              },
              {
                icon: '!',
                title: 'Risk Detection',
                desc: 'Flag sessions with indicators of self-harm or crisis, with exact quote extraction for immediate supervisor attention.'
              },
              {
                icon: '#',
                title: 'Protocol Scoring',
                desc: "Evaluate content coverage, facilitation quality, and safety using Shamiri's evidence-based grading rubric."
              },
              {
                icon: '✓',
                title: 'Human Validation',
                desc: 'Supervisors can validate or reject AI findings, ensuring quality control and continuous model improvement.'
              },
              {
                icon: '∞',
                title: 'Accessible Design',
                desc: 'Web-based dashboard optimized for low-bandwidth environments across Africa—no heavy infrastructure needed.'
              },
              {
                icon: '»',
                title: 'Built For Speed',
                desc: 'Review 10+ sessions in the time it takes to manually review one, with streaming AI responses and optimistic UI.'
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-12 bg-white transition-all duration-200 
                  ${idx % 2 === 0 ? 'md:border-r-3 border-black' : ''} 
                  ${idx < 4 ? 'md:border-b-3 border-black' : ''}
                  ${idx === 4 ? 'border-b-3 md:border-b-0 border-black' : ''}
                  hover:bg-black hover:text-white group`}
              >
                <div
                  className="w-15 h-15 border-3 border-black flex items-center justify-center text-2xl 
                  mb-8 bg-black text-white transition-all duration-200
                  group-hover:bg-white group-hover:text-black"
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p
                  className="text-gray-600 leading-relaxed font-sans text-sm
                  group-hover:text-gray-400"
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-32 border-t-2 border-black">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black mb-20 uppercase tracking-tighter">
            THE IMPACT
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 border-3 border-black">
            {[
              { number: '10M', label: 'Target Youth Served' },
              { number: '10x', label: 'Faster Review Time' },
              { number: '100%', label: 'Session Coverage' },
              { number: '24/7', label: 'Safety Monitoring' }
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-12 md:p-8 text-center transition-all duration-200
                  ${idx < 3 ? 'md:border-r-3 border-black' : ''}
                  ${idx < 3 ? 'border-b-3 md:border-b-0 border-black' : ''}
                  hover:bg-black group`}
              >
                <div
                  className="text-[clamp(2.5rem,4vw,4rem)] font-black mb-2 tracking-tight
                  group-hover:text-white"
                >
                  {stat.number}
                </div>
                <div
                  className="text-gray-600 text-xs uppercase tracking-wider
                  group-hover:text-white"
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="process" className="py-32 border-t-2 border-black">
          <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black mb-20 uppercase tracking-tighter">
            THE PROCESS
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {[
              {
                number: '01',
                title: 'Fellows Lead Sessions',
                desc: 'Shamiri Fellows deliver group therapy to young people following evidence-based protocols.'
              },
              {
                number: '02',
                title: 'AI Analysis',
                desc: 'LLM processes session transcripts, generating quality scores and safety flags instantly.'
              },
              {
                number: '03',
                title: 'Supervisor Review',
                desc: 'Tier 2 Supervisors review AI insights and validate or adjust findings with human expertise.'
              },
              {
                number: '04',
                title: 'Model Refinement',
                desc: 'Human feedback loops refine AI models, improving accuracy and protocol adherence over time.'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-8xl font-black leading-none mb-4 opacity-10">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold mb-4 uppercase tracking-wider">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-sans">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 border-t-2 border-black">
          <div
            className="border-5 border-black p-20 md:p-24 text-center relative overflow-hidden
            before:content-[''] before:absolute before:top-0 before:-left-full 
            before:w-full before:h-full before:bg-black before:transition-all before:duration-500
            hover:before:left-0 group"
          >
            <h2
              className="relative z-10 text-[clamp(2rem,4vw,3.5rem)] font-black mb-6 
              uppercase tracking-tight transition-colors duration-300
              group-hover:text-white"
            >
              SCALE QUALITY CARE
            </h2>

            <p
              className="relative z-10 text-lg mb-12 text-gray-600 font-sans transition-colors duration-300
              group-hover:text-white"
            >
              Join Shamiri in bringing evidence-based mental health
              interventions to millions of young people.
            </p>

            <a
              href="#"
              className="relative z-10 px-12 py-4 text-xs font-bold border-3 border-black 
                bg-transparent text-black no-underline uppercase tracking-wider font-mono
                inline-block overflow-hidden transition-colors duration-200
                before:content-[''] before:absolute before:top-0 before:-left-full 
                before:w-full before:h-full before:bg-white before:transition-all before:duration-300
                hover:before:left-0 hover:text-black group-hover:border-white
                group-hover:text-white hover:group-hover:text-black"
            >
              <span className="relative z-20">Request Access</span>
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="about"
          className="py-12 text-center border-t-2 border-black"
        >
          <p className="text-gray-400 text-xs uppercase tracking-wider">
            © 2025 SHAMIRI /// Tiered Care • Evidence-Based • AI-Augmented
          </p>
        </footer>
      </div>
    </div>
  );
}
