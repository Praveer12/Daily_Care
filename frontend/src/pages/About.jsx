import { motion } from 'framer-motion';
import { Leaf, Heart, Award, Users, Target, Eye } from 'lucide-react';
import './About.css';

const About = () => {
  const values = [
    {
      icon: <Leaf size={32} />,
      title: 'Natural Ingredients',
      description: 'We source only the finest natural ingredients from sustainable farms around the world.'
    },
    {
      icon: <Heart size={32} />,
      title: 'Cruelty Free',
      description: 'All our products are 100% cruelty-free. We never test on animals.'
    },
    {
      icon: <Award size={32} />,
      title: 'Quality First',
      description: 'Every product undergoes rigorous testing to ensure the highest quality standards.'
    },
    {
      icon: <Users size={32} />,
      title: 'Community Driven',
      description: 'We listen to our community and create products that truly meet their needs.'
    }
  ];

  const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '100+', label: 'Products' },
    { number: '500+', label: 'Cities in India' },
    { number: '99%', label: 'Satisfaction Rate' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <motion.div
            className="about-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-tag">Our Story</span>
            <h1>Beauty That Cares for You and the Planet</h1>
            <p>
              Founded in 2020, PureGlow was born from a simple belief: everyone deserves 
              access to clean, effective, and sustainable beauty products.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <div className="container">
          <div className="story-grid">
            <motion.div
              className="story-image"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600"
                alt="Our Story"
              />
            </motion.div>
            <motion.div
              className="story-content"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2>How It All Started</h2>
              <p>
                Our journey began when our founder, struggling to find skincare products 
                that were both effective and environmentally conscious, decided to create 
                her own. What started as a small kitchen experiment has grown into a 
                beloved brand trusted by thousands.
              </p>
              <p>
                Today, we continue to innovate and expand our range, always staying true 
                to our core values of sustainability, transparency, and efficacy. Every 
                product we create is a testament to our commitment to your wellbeing and 
                the health of our planet.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <motion.div
              className="mission-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Target size={40} />
              <h3>Our Mission</h3>
              <p>
                To provide accessible, high-quality daily care products that enhance 
                your natural beauty while respecting our planet and all its inhabitants.
              </p>
            </motion.div>
            <motion.div
              className="mission-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Eye size={40} />
              <h3>Our Vision</h3>
              <p>
                To become the world's most trusted sustainable beauty brand, inspiring 
                a global movement towards conscious consumption and self-care.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">What We Stand For</span>
            <h2>Our Core Values</h2>
          </motion.div>
          <div className="values-grid">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="value-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-card"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="stat-number">{stat.number}</span>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-tag">The People Behind PureGlow</span>
            <h2>Meet Our Team</h2>
          </motion.div>
          <div className="team-grid">
            {[
              { name: 'Sarah Johnson', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300' },
              { name: 'Michael Chen', role: 'Head of Product', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' },
              { name: 'Emma Williams', role: 'Lead Chemist', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300' },
              { name: 'David Park', role: 'Creative Director', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300' }
            ].map((member, index) => (
              <motion.div
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <img src={member.image} alt={member.name} />
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
