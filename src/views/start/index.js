import * as THREE from 'three'
import { useCallback, useEffect, useRef } from 'react'
import './index.scss'

const Page = () => {
    const Body = useRef()
    const Scene = useRef(new THREE.Scene()).current // 场景
    const Camera = useRef(new THREE.PerspectiveCamera()).current // 透视相机
    const Render = useRef(new THREE.WebGLRenderer({ antialias: true })).current  // 渲染器
    const Meshs = useRef([]).current

    const createRect = useCallback(() => {
        const rect = new THREE.BoxBufferGeometry(2, 2, 2)
        const meshBasicMater = new THREE.MeshBasicMaterial({ color: 'red' })
        const mesh = new THREE.Mesh(rect, meshBasicMater)
        mesh.position.set(0, 0, 0)
        Scene.add(mesh)
        Meshs.push(mesh)
    }, [])

    const init = useCallback(() => {
        Render.setSize(Body.current.offsetWidth, Body.current.offsetHeight)
        // 设置相机参数
        Camera.aspect = Body.current.offsetWidth / Body.current.offsetHeight
        Camera.fov = 45
        Camera.near = 1
        Camera.far = 1000
        Camera.position.set(0, 10, 20)
        Camera.lookAt(0, 0, 0)
        Camera.updateProjectionMatrix()
    }, [Render, Body])

    // 渲染画面
    const renderScene = useCallback(() => {
        Render.render(Scene, Camera)
        Meshs.forEach(item => {
            item.rotation.x += 0.5 / 180 * Math.PI 
            item.rotation.y += 0.5 / 180 * Math.PI 
        })
        window.requestAnimationFrame(() => renderScene())
    }, [Render, Meshs])

    useEffect(() => {
        console.log(1)
        Body.current.append(Render.domElement)
        init()
        createRect()
        renderScene()
    }, [])

    return (
        <div className="page" ref={Body} ></div>
    )
}

export default Page
