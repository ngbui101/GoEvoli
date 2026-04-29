import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Panel } from '../components/ui/Panel';

export const DesignSystem: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-evoli-bg p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-12">
        <section>
          <h1>Design System</h1>
          <p className="text-lg">Willkommen beim GoEvoli Design-System. Warm, modern, weich und leicht verspielt.</p>
        </section>

        <section className="space-y-6">
          <h2>Typography</h2>
          <Panel title="Headings & Text">
            <h1>Heading 1 - Black Tracking Tight</h1>
            <h2>Heading 2 - Bold Tracking Tight</h2>
            <h3>Heading 3 - Bold Text</h3>
            <p>Dies ist ein Standard-Paragraph. Er nutzt eine angenehme Zeilenhöhe und eine leichte Transparenz für bessere Lesbarkeit auf dem hellgelben Hintergrund.</p>
            <span className="text-xs font-black uppercase tracking-widest text-evoli-text/70">Small Label Text</span>
          </Panel>
        </section>

        <section className="space-y-6">
          <h2>Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium (Default)</Button>
            <Button size="lg">Large Button</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button isLoading>Loading...</Button>
            <Button disabled>Disabled Button</Button>
          </div>
        </section>

        <section className="space-y-6">
          <h2>Forms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="space-y-6">
              <Input label="Name" placeholder="Dein Name..." id="ds-name" />
              <Input label="E-Mail" type="email" placeholder="email@example.com" error="Bitte gib eine gültige E-Mail-Adresse ein." id="ds-email" />
              <Select 
                label="Priorität" 
                id="ds-priority"
                options={[
                  { label: 'Niedrig', value: 'LOW' },
                  { label: 'Mittel', value: 'MEDIUM' },
                  { label: 'Hoch', value: 'HIGH' },
                ]} 
              />
              <Textarea label="Beschreibung" placeholder="Schreibe etwas..." rows={4} id="ds-desc" />
            </Card>
            <div className="space-y-4">
              <h3>Badges</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2>Cards & Modals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hoverable>
              <h3>Hoverable Card</h3>
              <p>Fahre mit der Maus über mich, um den weichen Schatten und die Bewegung zu sehen.</p>
            </Card>
            <Card>
              <h3>Static Card</h3>
              <p>Eine einfache Karte mit dem Evoli-Box-Shadow und abgerundeten Ecken.</p>
            </Card>
            <Panel title="Action Panel">
              <p>Öffne ein Modal, um die Komponente zu testen.</p>
              <Button onClick={() => setIsModalOpen(true)} className="w-full">Open Modal</Button>
            </Panel>
          </div>
        </section>

        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          title="Beispiel Modal"
        >
          <div className="p-8 space-y-4">
            <p>Dies ist ein wiederverwendbares Modal mit einem weichen Backdrop-Blur und sanften Animationen.</p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Abbrechen</Button>
              <Button onClick={() => setIsModalOpen(false)}>Bestätigen</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
