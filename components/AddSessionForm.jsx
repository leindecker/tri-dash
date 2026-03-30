'use client';

import { Card, Form, Select, InputNumber, Input, Button, Row, Col, App } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { SPORTS, DAYS, getWeekKey } from '@/lib/constants';

const { Option } = Select;

export default function AddSessionForm({ weekOffset, onAdd }) {
  const [form] = Form.useForm();
  const { message } = App.useApp();

  const onFinish = (values) => {
    if (!values.mins) { message.warning('Informe a duração.'); return; }
    onAdd({
      id:      Date.now() + '',
      source:  'manual',
      sport:   values.sport,
      day:     values.day,
      desc:    values.desc || '',
      mins:    values.mins,
      dist:    values.dist || 0,
      tss:     values.tss  || 0,
      weekKey: getWeekKey(weekOffset),
    });
    form.resetFields(['desc', 'mins', 'dist', 'tss']);
  };

  return (
    <Card
      title={<span style={{ fontSize: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adicionar manualmente</span>}
      size="small"
      styles={{ body: { padding: '12px 14px' } }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}
        initialValues={{ sport: 'run', day: 0 }}
        style={{ marginTop: 4 }}
      >
        <Row gutter={[8, 0]} align="bottom">
          <Col xs={12} sm={4}>
            <Form.Item name="sport" label="Modalidade" style={{ marginBottom: 0 }}>
              <Select size="small">
                {Object.entries(SPORTS).map(([k, sp]) => (
                  <Option key={k} value={k}>{sp.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={12} sm={3}>
            <Form.Item name="day" label="Dia" style={{ marginBottom: 0 }}>
              <Select size="small">
                {DAYS.map((d, i) => <Option key={i} value={i}>{d}</Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={5}>
            <Form.Item name="desc" label="Descrição" style={{ marginBottom: 0 }}>
              <Input size="small" placeholder="ex: Intervalado 4x1km" />
            </Form.Item>
          </Col>
          <Col xs={8} sm={3}>
            <Form.Item name="mins" label="Duração (min)" style={{ marginBottom: 0 }}>
              <InputNumber size="small" min={1} placeholder="60" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={8} sm={3}>
            <Form.Item name="dist" label="Distância (km)" style={{ marginBottom: 0 }}>
              <InputNumber size="small" min={0} step={0.1} placeholder="10" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={8} sm={3}>
            <Form.Item name="tss" label="TSS" style={{ marginBottom: 0 }}>
              <InputNumber size="small" min={0} placeholder="80" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={3}>
            <Form.Item label=" " style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" size="small" icon={<PlusOutlined />} block>
                Add
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  );
}
